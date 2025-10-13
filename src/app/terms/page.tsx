import { Metadata } from 'next';
import { Box, Typography, Paper, Link } from '@mui/material';

export const metadata: Metadata = {
  title: 'Terms of Service | ChefPax',
  description: 'ChefPax Terms of Service and SMS messaging consent.',
  robots: 'index, follow',
};

export default function TermsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            Terms of Service
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Last updated: October 2024
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', mt: 3 }}>
            SMS Messaging Consent
          </Typography>
          
          <Typography variant="body1" paragraph>
            By providing your mobile phone number and opting in to receive SMS messages from ChefPax, you consent to receive automated text messages at the phone number provided. Message frequency varies based on your account activity and preferences.
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Types of messages we send:</strong>
          </Typography>
          <ul>
            <li>Order confirmations and tracking updates</li>
            <li>Delivery notifications and time windows</li>
            <li>Subscription reminders and account updates</li>
            <li>Customer care responses</li>
          </ul>

          <Typography variant="body1" paragraph>
            <strong>Opt-out instructions:</strong> You may opt out of receiving SMS messages at any time by replying "STOP" to any message. You may also opt out by contacting us at alerts@chefpax.com or updating your account preferences.
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Message and data rates:</strong> Standard message and data rates may apply. Message frequency varies.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', mt: 3 }}>
            Contact Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            For questions about these terms or our SMS messaging practices, contact us at:
          </Typography>
          
          <Typography variant="body1" paragraph>
            Email: <Link href="mailto:alerts@chefpax.com" sx={{ color: '#2E7D32' }}>alerts@chefpax.com</Link><br />
            Website: <Link href="https://chefpax.com" sx={{ color: '#2E7D32' }}>chefpax.com</Link>
          </Typography>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              By using ChefPax services, you agree to these terms. We reserve the right to modify these terms at any time.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
