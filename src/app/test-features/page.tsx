"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Grid,
  Container,
} from '@mui/material';
import WelcomeBackDashboard from '@/components/WelcomeBackDashboard';
import OrderTrackingCalendar from '@/components/OrderTrackingCalendar';

export default function TestFeaturesPage() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestTracking = async () => {
    if (!email && !orderId) {
      setError('Please enter either email or order ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (orderId) params.append('orderId', orderId);
      
      const response = await fetch(`/api/orders/tracking?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setTrackingData(data);
      } else {
        setError(data.error || 'Failed to fetch tracking data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        🧪 Test New Features
      </Typography>
      
      <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        Test the new order tracking and welcome back features
      </Typography>

      <Grid container spacing={4}>
        {/* Guest Order Tracking */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                🔍 Guest Order Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test order tracking without signing in. Use your email or order ID from a recent order.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Order ID (Optional)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Order ID from confirmation email"
                />
              </Box>
              
              <Button
                variant="contained"
                onClick={handleGuestTracking}
                disabled={loading}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
                  },
                }}
              >
                {loading ? 'Loading...' : 'Track Orders'}
              </Button>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              {trackingData && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Found {trackingData.total} order(s)
                  </Alert>
                  <OrderTrackingCalendar 
                    orders={trackingData.orders} 
                    onOrderSelect={(order) => console.log('Selected order:', order)}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Signed-In User Features */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                👤 Signed-In User Features
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                To test the welcome back dashboard and personalized features, you need to be signed in.
              </Typography>
              
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Features for signed-in users:</strong>
                </Typography>
                <ul>
                  <li>Personalized welcome back dashboard</li>
                  <li>Customer insights and statistics</li>
                  <li>Loyalty points tracking</li>
                  <li>Personalized recommendations</li>
                  <li>Order history with calendar view</li>
                  <li>Subscription management</li>
                </ul>
              </Box>
              
              <Button
                variant="outlined"
                href="/api/auth/signin"
                fullWidth
                sx={{ mb: 2 }}
              >
                Sign In to Test
              </Button>
              
              <Alert severity="info">
                After signing in, visit your account page to see the new welcome back dashboard!
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demo Section */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🎯 What's New
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  📅 Calendar View
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  See all your orders on a visual calendar with delivery dates and status updates.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  🌱 Growth Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your microgreens from seeding to delivery with real-time growth stages.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  🎉 Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personalized dashboard with insights, recommendations, and quick actions.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
