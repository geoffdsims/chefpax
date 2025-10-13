import { Metadata } from 'next';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';

export const metadata: Metadata = {
  title: 'SMS Opt-In | ChefPax',
  description: 'Opt-in for ChefPax SMS notifications for order updates and delivery confirmations.',
  robots: 'index, follow',
};

export default function SMSOptInPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            🌱 ChefPax SMS Notifications
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Opt-in to receive SMS notifications for:</strong>
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>Order confirmations and tracking</li>
              <li>Delivery updates and time windows</li>
              <li>Subscription reminders</li>
              <li>Customer care inquiries</li>
            </ul>
          </Alert>

          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
            How to Opt-In:
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Method 1 - During Checkout:</strong><br />
            When placing an order, check the box "Send me SMS updates about my order" and enter your mobile number.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Method 2 - Account Settings:</strong><br />
            Log into your ChefPax account and enable SMS notifications in your profile settings.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Method 3 - Reply to Our Messages:</strong><br />
            Reply "YES" or "START" to any SMS message from ChefPax to confirm your opt-in.
          </Typography>

          <Box sx={{ mt: 4, p: 2, bgcolor: '#E8F5E8', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              <strong>Sample Message:</strong><br />
              "🌱 ChefPax Update: Your microgreens order #12345 is on the way! Expected delivery: 2:30 PM (2:00 PM - 4:00 PM). Track your order at chefpax.com/account"
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Message Frequency:</strong> Transactional only - we only send messages about your orders and account.<br />
              <strong>Data Rates:</strong> Standard message and data rates may apply.<br />
              <strong>Opt-Out:</strong> Reply "STOP" to any message to opt-out at any time.
            </Typography>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              href="/shop" 
              sx={{ 
                bgcolor: '#2E7D32', 
                '&:hover': { bgcolor: '#1B5E20' },
                px: 3,
                py: 1.5
              }}
            >
              Shop Now
            </Button>
            <Button 
              variant="outlined" 
              href="/account" 
              sx={{ 
                borderColor: '#2E7D32', 
                color: '#2E7D32',
                '&:hover': { borderColor: '#1B5E20', bgcolor: '#E8F5E8' }
              }}
            >
              Account Settings
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Privacy Policy:</strong> <a href="/privacy" style={{ color: '#2E7D32' }}>chefpax.com/privacy</a><br />
              <strong>Terms of Service:</strong> <a href="/terms" style={{ color: '#2E7D32' }}>chefpax.com/terms</a><br />
              <strong>Contact:</strong> <a href="mailto:alerts@chefpax.com" style={{ color: '#2E7D32' }}>alerts@chefpax.com</a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
