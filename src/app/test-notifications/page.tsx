"use client";

import React, { useState } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import PushNotificationManager from '@/components/PushNotificationManager';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

export default function TestNotificationsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTokenReceived = (fcmToken: string) => {
    console.log('FCM Token received:', fcmToken);
    setToken(fcmToken);
  };

  const sendTestNotification = async () => {
    if (!token) {
      setTestResult('Please enable notifications first!');
      return;
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🌱 ChefPax Test Notification',
          body: 'Your fresh microgreens are ready for harvest!',
          token: token,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult('✅ Test notification sent successfully!');
      } else {
        setTestResult(`❌ Error: ${data.error || 'Failed to send notification'}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <NotificationsActiveIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Push Notification Test
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Test Firebase Cloud Messaging integration for ChefPax
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 1: Enable Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click the button below to request notification permission
          </Typography>
          <PushNotificationManager onTokenReceived={handleTokenReceived} />
        </CardContent>
      </Card>

      {token && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Step 2: Send Test Notification
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Your device is registered! Click below to send a test notification.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={sendTestNotification}
              fullWidth
            >
              Send Test Notification
            </Button>
            {testResult && (
              <Alert severity={testResult.includes('✅') ? 'success' : 'error'} sx={{ mt: 2 }}>
                {testResult}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Technical Details
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Status:</strong>
            <ul>
              <li>Firebase Configuration: ✅ Configured</li>
              <li>VAPID Key: ✅ Set</li>
              <li>FCM Token: {token ? '✅ Registered' : '⏳ Waiting...'}</li>
            </ul>
          </Typography>
          {token && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Token: {token.substring(0, 20)}...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}






