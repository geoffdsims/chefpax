"use client";

import React, { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { Button, Alert, Box } from '@mui/material';

interface PushNotificationManagerProps {
  onTokenReceived?: (token: string) => void;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ 
  onTokenReceived 
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current permission status
    setPermission(Notification.permission);

    // Set up message listener
    const unsubscribe = onMessageListener();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        setPermission('granted');
        setError(null);
        
        if (onTokenReceived) {
          onTokenReceived(fcmToken);
        }

        // Send token to your server to store for this user
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: fcmToken,
            userId: 'current-user-id' // Replace with actual user ID
          })
        });
      } else {
        setPermission('denied');
        setError('Failed to get notification token');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setError('Error enabling notifications');
    }
  };

  if (permission === 'granted') {
    return (
      <Box>
        <Alert severity="success">
          ✅ Push notifications enabled! You'll receive updates about your microgreen orders.
        </Alert>
        {token && (
          <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
            Token: {token.substring(0, 20)}...
          </Box>
        )}
      </Box>
    );
  }

  if (permission === 'denied') {
    return (
      <Alert severity="warning">
        Push notifications are blocked. Please enable them in your browser settings.
      </Alert>
    );
  }

  return (
    <Box>
      <Button 
        variant="contained" 
        onClick={handleEnableNotifications}
        sx={{ mb: 1 }}
      >
        🔔 Enable Push Notifications
      </Button>
      <Box sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
        Get notified about order updates, delivery confirmations, and harvest alerts!
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default PushNotificationManager;
