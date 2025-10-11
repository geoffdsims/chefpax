"use client";

import { useState } from 'react';
import { Box, Container, Typography, Paper, Button, TextField, Alert, CircularProgress, Divider } from '@mui/material';
import { Email as EmailIcon, ShoppingCart as CartIcon, PersonAdd as WelcomeIcon } from '@mui/icons-material';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testOrderConfirmation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate order confirmation data
      const response = await fetch('/api/email/abandoned-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: 'test@chefpax.com',
          customerName: 'Test Customer',
          cartItems: [
            { name: 'ChefPax Mix Live Tray', quantity: 1, price: 35.00 },
            { name: 'Pea Shoots Live Tray', quantity: 1, price: 25.00 }
          ],
          cartTotal: 60.00,
          checkoutUrl: 'https://chefpax.com/cart'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@chefpax.com',
          name: 'Test Customer'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAbandonedCart = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/email/abandoned-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: 'test@chefpax.com',
          customerName: 'Test Customer',
          cartItems: [
            { name: 'ChefPax Mix Live Tray', quantity: 1, price: 35.00 }
          ],
          cartTotal: 35.00,
          checkoutUrl: 'https://chefpax.com/cart'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📧 Email Automation Testing
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Test your email automation system for ChefPax. This will send actual emails 
          (in demo mode if SendGrid is not configured).
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Welcome Email Test */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WelcomeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Welcome Email</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Test the welcome email sent to new customers when they sign up.
            </Typography>
            <Button
              variant="contained"
              onClick={testWelcomeEmail}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WelcomeIcon />}
            >
              {loading ? 'Sending...' : 'Test Welcome Email'}
            </Button>
          </Paper>

          {/* Abandoned Cart Test */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CartIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Abandoned Cart Reminder</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Test the abandoned cart reminder email sent to customers who leave items in their cart.
            </Typography>
            <Button
              variant="contained"
              onClick={testAbandonedCart}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CartIcon />}
              color="warning"
            >
              {loading ? 'Sending...' : 'Test Abandoned Cart Email'}
            </Button>
          </Paper>

          <Divider />

          {/* Results */}
          {result && (
            <Alert severity={result.success ? "success" : "error"}>
              <Typography variant="subtitle2" gutterBottom>
                {result.success ? '✅ Email Sent Successfully!' : '❌ Email Failed'}
              </Typography>
              <Typography variant="body2">
                {result.message || result.error}
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              <Typography variant="subtitle2" gutterBottom>
                ❌ Error
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}

          {/* Configuration Info */}
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              📋 Email Configuration
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Current Mode:</strong> {process.env.NEXT_PUBLIC_SENDGRID_API_KEY ? 'Production (SendGrid)' : 'Demo Mode'}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>SendGrid API Key:</strong> {process.env.NEXT_PUBLIC_SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}
            </Typography>
            <Typography variant="body2">
              <strong>From Email:</strong> {process.env.NEXT_PUBLIC_FROM_EMAIL || 'hello@chefpax.com'}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
}
