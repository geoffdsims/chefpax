'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Typography
} from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';

interface AddressValidatorProps {
  value: string;
  onChange: (address: string) => void;
  onValidation: (isValid: boolean, formattedAddress?: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

interface GooglePlaceResult {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressValidator({
  value,
  onChange,
  onValidation,
  label = "Street Address",
  required = true,
  disabled = false
}: AddressValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid' | 'warning'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.log('Waiting for Google Maps API...');
        setTimeout(initAutocomplete, 100);
        return;
      }

      if (!inputRef.current || autocompleteRef.current) {
        return;
      }

      console.log('Initializing Google Places Autocomplete...');

      try {
        // Create autocomplete instance with a separate input element
        const autocompleteInput = document.createElement('input');
        autocompleteInput.style.position = 'absolute';
        autocompleteInput.style.left = '-9999px';
        autocompleteInput.style.opacity = '0';
        document.body.appendChild(autocompleteInput);
        
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInput, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'address_components', 'geometry']
        });

        autocompleteRef.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry || !place.formatted_address) {
            console.log('No details available for input');
            return;
          }

          console.log('Place selected:', place);
          
          // Update the visible address field
          onChange(place.formatted_address);
          
          // Validate the selected address
          validateSelectedPlace(place);
        });

        // Sync the hidden input with the visible input for autocomplete
        const syncInputs = () => {
          if (inputRef.current && autocompleteInput) {
            autocompleteInput.value = inputRef.current.value;
          }
        };

        // Listen to the visible input changes
        if (inputRef.current) {
          inputRef.current.addEventListener('input', syncInputs);
        }

        console.log('Google Places Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const validateSelectedPlace = (place: any) => {
    setIsValidating(true);
    
    try {
      const addressComponents = place.address_components;
      
      // Find city and state components
      const cityComponent = addressComponents.find((component: any) => 
        component.types.includes('locality') || component.types.includes('administrative_area_level_2')
      );
      const stateComponent = addressComponents.find((component: any) => 
        component.types.includes('administrative_area_level_1')
      );
      
      const cityName = cityComponent?.long_name?.toLowerCase() || '';
      const stateCode = stateComponent?.short_name || '';
      
      console.log('Validating place:', { cityName, stateCode, addressComponents });
      
      // Austin metro area cities (within 1 hour drive)
      const deliveryCities = [
        'austin',
        'manor',           // ChefPax HQ location
        'pflugerville',
        'round rock',
        'cedar park',
        'leander',
        'georgetown',
        'buda',
        'kyle',
        'bee cave',
        'lakeway',
        'dripping springs',
        'west lake hills',
        'rollingwood',
        'sunset valley',
        'del valle',
        'elgin',
        'hutto'
      ];
      
      const isInTexas = stateCode === 'TX';
      const isInDeliveryArea = deliveryCities.some(city => cityName.includes(city));
      
      setIsValidating(false);
      
      if (isInDeliveryArea && isInTexas) {
        setValidationStatus('valid');
        setValidationMessage('✅ Valid delivery address');
        setFormattedAddress(place.formatted_address);
        onValidation(true, place.formatted_address);
      } else if (isInTexas) {
        setValidationStatus('warning');
        setValidationMessage('⚠️ Address outside Austin metro delivery area');
        setFormattedAddress(place.formatted_address);
        onValidation(false);
      } else {
        setValidationStatus('warning');
        setValidationMessage('⚠️ Address outside Texas delivery area');
        setFormattedAddress(place.formatted_address);
        onValidation(false);
      }
    } catch (error) {
      console.error('Error validating place:', error);
      setIsValidating(false);
      setValidationStatus('invalid');
      setValidationMessage('❌ Address validation failed');
      onValidation(false);
    }
  };

  const validateAddress = async (address: string) => {
    if (!address.trim()) {
      setValidationStatus('idle');
      setValidationMessage('');
      onValidation(false);
      return;
    }

    // Basic validation first
    if (address.length < 10) {
      setValidationStatus('invalid');
      setValidationMessage('❌ Please enter a complete street address');
      onValidation(false);
      return;
    }

    // Check for obviously fake addresses
    const fakeAddresses = ['lol', 'test', 'fake', '123', 'asdf', 'qwerty'];
    if (fakeAddresses.some(fake => address.toLowerCase().includes(fake))) {
      setValidationStatus('invalid');
      setValidationMessage('❌ Please enter a real street address');
      onValidation(false);
      return;
    }

    // Wait for Google Maps API to load
    if (!window.google || !window.google.maps) {
      setIsValidating(true);
      setValidationStatus('idle');
      setValidationMessage('⏳ Loading address validation...');
      
      // Wait for Google Maps to load
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          validateWithGoogleMaps(address);
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      
      checkGoogleMaps();
      return;
    }

    validateWithGoogleMaps(address);
  };

  const validateWithGoogleMaps = (address: string) => {
    setIsValidating(true);
    setValidationStatus('idle');

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ 
        address: address,
        region: 'US' // Bias results to US addresses
      }, (results: GooglePlaceResult[], status: string) => {
        setIsValidating(false);
        
        console.log('Google Geocoding result:', { status, results });
        
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const addressComponents = result.address_components;
          
          // Find city and state components
          const cityComponent = addressComponents.find(component => 
            component.types.includes('locality') || component.types.includes('administrative_area_level_2')
          );
          const stateComponent = addressComponents.find(component => 
            component.types.includes('administrative_area_level_1')
          );
          
          const cityName = cityComponent?.long_name?.toLowerCase() || '';
          const stateCode = stateComponent?.short_name || '';
          
          console.log('Address components:', { cityName, stateCode, addressComponents });
          
          // Austin metro area cities (within 1 hour drive)
          const deliveryCities = [
            'austin',
            'manor',           // ChefPax HQ location
            'pflugerville',
            'round rock',
            'cedar park',
            'leander',
            'georgetown',
            'buda',
            'kyle',
            'bee cave',
            'lakeway',
            'dripping springs',
            'west lake hills',
            'rollingwood',
            'sunset valley',
            'del valle',
            'elgin',
            'hutto'
          ];
          
          const isInTexas = stateCode === 'TX';
          const isInDeliveryArea = deliveryCities.some(city => cityName.includes(city));
          
          if (isInDeliveryArea && isInTexas) {
            setValidationStatus('valid');
            setValidationMessage('✅ Valid delivery address');
            setFormattedAddress(result.formatted_address);
            onValidation(true, result.formatted_address);
          } else if (isInTexas) {
            setValidationStatus('warning');
            setValidationMessage('⚠️ Address outside Austin metro delivery area');
            setFormattedAddress(result.formatted_address);
            onValidation(false);
          } else {
            setValidationStatus('warning');
            setValidationMessage('⚠️ Address outside Texas delivery area');
            setFormattedAddress(result.formatted_address);
            onValidation(false);
          }
        } else if (status === 'ZERO_RESULTS') {
          setValidationStatus('invalid');
          setValidationMessage('❌ Address not found');
          setFormattedAddress('');
          onValidation(false);
        } else {
          setValidationStatus('invalid');
          setValidationMessage(`❌ Address validation failed: ${status}`);
          setFormattedAddress('');
          onValidation(false);
        }
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setIsValidating(false);
      setValidationStatus('invalid');
      setValidationMessage('❌ Address validation failed');
      onValidation(false);
    }
  };

  const handleAddressChange = (newAddress: string) => {
    onChange(newAddress);
    
    // Clear any existing timeout
    if (window.addressValidationTimeout) {
      clearTimeout(window.addressValidationTimeout);
    }
    
    // Debounce validation - only validate after user stops typing
    window.addressValidationTimeout = setTimeout(() => {
      validateAddress(newAddress);
    }, 1000); // Increased to 1 second to avoid interference
  };

  const getStatusColor = () => {
    switch (validationStatus) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'valid': return <CheckCircle />;
      case 'invalid': return <Error />;
      case 'warning': return <Warning />;
      default: return null;
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => handleAddressChange(e.target.value)}
        required={required}
        disabled={disabled || isValidating}
        placeholder="Start typing your address..."
        helperText="We deliver within the Austin metro area (within 1 hour drive)"
        inputRef={inputRef}
        sx={{ mb: 1 }}
      />
      
      {isValidating && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Validating address...
          </Typography>
        </Box>
      )}
      
      {validationStatus === 'valid' && (
        <Alert severity="success" sx={{ mb: 1 }} icon={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ fontSize: 20 }} />
            <Typography variant="body2">Valid delivery address</Typography>
          </Box>
        </Alert>
      )}
      
      {validationStatus === 'warning' && (
        <Alert severity="warning" sx={{ mb: 1 }} icon={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Address outside delivery area</Typography>
              <Typography variant="caption">
                We currently deliver within the Austin metro area (within 1 hour drive from Manor).
              </Typography>
            </Box>
          </Box>
        </Alert>
      )}
      
      {validationStatus === 'invalid' && (
        <Alert severity="error" sx={{ mb: 1 }} icon={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Error sx={{ fontSize: 20 }} />
            <Typography variant="body2">Please enter a valid street address for delivery.</Typography>
          </Box>
        </Alert>
      )}
    </Box>
  );
}
