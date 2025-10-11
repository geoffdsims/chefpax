'use client';

import { useState } from 'react';
import { Container, Paper, Typography, Button, TextField, Box, Alert, MenuItem } from '@mui/material';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function TestSMSPage() {
  const [phone, setPhone] = useState('');
  const [smsType, setSmsType] = useState('order_confirmation');
  const [result, setResult] = useState<{ success: boolean; message: string; demoMode?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const sendTestSMS = async () => {
    if (!phone) {
      setResult({ success: false, message: 'Please enter a phone number' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/sms/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: smsType })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          success: true, 
          message: data.message, 
          demoMode: data.demoMode 
        });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send SMS' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const smsTypes = [
    { value: 'order_confirmation', label: 'Order Confirmation', icon: <CheckCircleIcon /> },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: <LocalShippingIcon /> },
    { value: 'delivered', label: 'Delivered', icon: <CheckCircleIcon /> },
    { value: 'delivery_reminder', label: 'Delivery Reminder', icon: <NotificationsIcon /> },
    { value: 'harvest_notification', label: 'Harvest Notification', icon: <PhoneIcon /> }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SmsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4">📱 SMS Automation Testing</Typography>
        </Box>

        <Typography variant="body1" paragraph color="text.secondary">
          Test your SMS automation system for ChefPax. This will send actual SMS messages (in demo mode if Twilio is not configured).
        </Typography>

        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+15125551234"
            helperText="Include country code (e.g., +1 for US)"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <TextField
            select
            fullWidth
            label="SMS Type"
            value={smsType}
            onChange={(e) => setSmsType(e.target.value)}
            sx={{ mb: 3 }}
          >
            {smsTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {type.icon}
                  {type.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={sendTestSMS}
            disabled={loading || !phone}
            startIcon={<SmsIcon />}
          >
            {loading ? 'Sending...' : 'Send Test SMS'}
          </Button>

          {result && (
            <Alert 
              severity={result.success ? 'success' : 'error'} 
              sx={{ mt: 3 }}
            >
              {result.message}
              {result.demoMode && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  <strong>Demo Mode:</strong> Check server console for SMS output. Configure Twilio credentials to send real SMS.
                </Typography>
              )}
            </Alert>
          )}
        </Box>

        <Paper elevation={0} sx={{ mt: 4, p: 3, backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom>
            📋 SMS Configuration
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Current Mode:</strong> {process.env.NEXT_PUBLIC_TWILIO_CONFIGURED ? 'Live Mode' : 'Demo Mode'}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Twilio Account SID:</strong> {process.env.NEXT_PUBLIC_TWILIO_CONFIGURED ? '✅ Configured' : '❌ Not configured'}
          </Typography>
          <Typography variant="body2">
            <strong>From Phone:</strong> {process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || '+15005550006 (Test)'}
          </Typography>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🚀 SMS Types Available:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li><Typography variant="body2"><strong>Order Confirmation:</strong> Sent immediately after order is placed</Typography></li>
            <li><Typography variant="body2"><strong>Out for Delivery:</strong> Sent when order is out for delivery with ETA</Typography></li>
            <li><Typography variant="body2"><strong>Delivered:</strong> Sent when order is successfully delivered</Typography></li>
            <li><Typography variant="body2"><strong>Delivery Reminder:</strong> Sent 1 day before scheduled delivery</Typography></li>
            <li><Typography variant="body2"><strong>Harvest Notification:</strong> Sent when fresh harvest is available</Typography></li>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

