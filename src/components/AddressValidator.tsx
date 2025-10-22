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
      if (window.google && window.google.maps && window.google.maps.places) {
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
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

    // For now, accept any reasonable-looking address
    // TODO: Re-enable Google Maps validation once API issues are resolved
    setValidationStatus('warning');
    setValidationMessage('⚠️ Address accepted - please verify it\'s correct');
    onValidation(true);
    return;

    // Google Maps validation (disabled for now)
    /*
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      setValidationStatus('warning');
      setValidationMessage('⚠️ Address validation service unavailable - please verify your address');
      onValidation(true);
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: address }, (results: GooglePlaceResult[], status: string) => {
        setIsValidating(false);
        
        if (status === 'OK' && results.length > 0) {
          const result = results[0];
          const addressComponents = result.address_components;
          
          const cityComponent = addressComponents.find(component => 
            component.types.includes('locality')
          );
          const stateComponent = addressComponents.find(component => 
            component.types.includes('administrative_area_level_1')
          );
          
          const isInAustin = cityComponent?.long_name.toLowerCase().includes('austin');
          const isInTexas = stateComponent?.short_name === 'TX';
          
          if (isInAustin && isInTexas) {
            setValidationStatus('valid');
            setValidationMessage('✅ Valid Austin address');
            setFormattedAddress(result.formatted_address);
            onValidation(true, result.formatted_address);
          } else {
            setValidationStatus('warning');
            setValidationMessage('⚠️ Address outside Austin delivery area');
            setFormattedAddress(result.formatted_address);
            onValidation(false);
          }
        } else {
          setValidationStatus('invalid');
          setValidationMessage('❌ Invalid address format');
          setFormattedAddress('');
          onValidation(false);
        }
      });
    } catch (error) {
      setIsValidating(false);
      setValidationStatus('invalid');
      setValidationMessage('❌ Address validation failed');
      onValidation(false);
    }
    */
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
