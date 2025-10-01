"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';

interface EnhancedCheckoutProps {
  onCheckout: (data: CheckoutData) => void;
  loading?: boolean;
}

interface CheckoutData {
  customer: {
    name: string;
    email: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    deliveryInstructions?: string;
  };
  marketingOptIn: boolean;
  createAccount: boolean;
}

export default function EnhancedCheckout({ onCheckout, loading = false }: EnhancedCheckoutProps) {
  const [formData, setFormData] = useState<CheckoutData>({
    customer: {
      name: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      deliveryInstructions: '',
    },
    marketingOptIn: false,
    createAccount: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.name.trim()) newErrors.name = 'Name is required';
    if (!formData.customer.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.customer.email)) newErrors.email = 'Invalid email format';
    if (!formData.customer.address1.trim()) newErrors.address1 = 'Address is required';
    if (!formData.customer.city.trim()) newErrors.city = 'City is required';
    if (!formData.customer.state.trim()) newErrors.state = 'State is required';
    if (!formData.customer.zip.trim()) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCheckout(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        Checkout Information
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.customer.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.customer.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={formData.customer.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Delivery Address
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 1"
              value={formData.customer.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              error={!!errors.address1}
              helperText={errors.address1}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              value={formData.customer.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.customer.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              error={!!errors.city}
              helperText={errors.city}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.customer.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              error={!!errors.state}
              helperText={errors.state}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={formData.customer.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              error={!!errors.zip}
              helperText={errors.zip}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Delivery Instructions (Optional)"
              multiline
              rows={3}
              value={formData.customer.deliveryInstructions}
              onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
              placeholder="Any special delivery instructions..."
            />
          </Grid>

          {/* Preferences */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.marketingOptIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketingOptIn: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    Subscribe to ChefPax updates and promotions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Get exclusive discounts, delivery tips, and early access to new products
                  </Typography>
                </Box>
              }
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.createAccount}
                  onChange={(e) => setFormData(prev => ({ ...prev, createAccount: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    Create an account for future orders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Track orders, manage subscriptions, and earn loyalty points
                  </Typography>
                </Box>
              }
            />
          </Grid>

          {/* Benefits Alert */}
          {(formData.marketingOptIn || formData.createAccount) && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Great choices!</strong> You'll enjoy:
                  {formData.createAccount && (
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Order tracking and history</li>
                      <li>Loyalty points on every purchase</li>
                      <li>Easy subscription management</li>
                      <li>Personalized delivery preferences</li>
                    </ul>
                  )}
                  {formData.marketingOptIn && (
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Exclusive subscriber discounts</li>
                      <li>Early access to new products</li>
                      <li>Growing tips and recipes</li>
                      <li>Seasonal special offers</li>
                    </ul>
                  )}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
                },
              }}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Paper>
  );
}
