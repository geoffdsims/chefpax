'use client';

import { useState, useEffect } from 'react';
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

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        console.log('Google Maps API already loaded');
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        return;
      }

      console.log('Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

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
          
          const isInAustin = cityName.includes('austin');
          const isInTexas = stateCode === 'TX';
          
          if (isInAustin && isInTexas) {
            setValidationStatus('valid');
            setValidationMessage('✅ Valid Austin address');
            setFormattedAddress(result.formatted_address);
            onValidation(true, result.formatted_address);
          } else if (isInTexas) {
            setValidationStatus('warning');
            setValidationMessage('⚠️ Address outside Austin delivery area');
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
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateAddress(newAddress);
    }, 500);

    return () => clearTimeout(timeoutId);
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
        placeholder="Enter your street address"
        helperText="We deliver within Austin city limits"
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
      
      {validationMessage && (
        <Box sx={{ mb: 1 }}>
          <Chip
            icon={getStatusIcon()}
            label={validationMessage}
            color={getStatusColor() as any}
            size="small"
            variant="outlined"
          />
        </Box>
      )}
      
      {validationStatus === 'warning' && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          We currently only deliver within Austin city limits. 
          Your address appears to be outside our delivery area.
        </Alert>
      )}
      
      {validationStatus === 'invalid' && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Please enter a valid street address. We need a real address for delivery.
        </Alert>
      )}
    </Box>
  );
}
