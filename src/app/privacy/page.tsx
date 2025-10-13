import { Metadata } from 'next';
import { Box, Typography, Paper, Link } from '@mui/material';

export const metadata: Metadata = {
  title: 'Privacy Policy | ChefPax',
  description: 'ChefPax Privacy Policy and data protection practices.',
  robots: 'index, follow',
};

export default function PrivacyPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            Privacy Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Last updated: October 2024
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', mt: 3 }}>
            SMS Data Collection
          </Typography>
          
          <Typography variant="body1" paragraph>
            When you opt-in to receive SMS messages, we collect and store your mobile phone number for the purpose of sending you transactional notifications about your ChefPax orders and account.
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>How we use your phone number:</strong>
          </Typography>
          <ul>
            <li>Send order confirmations and tracking updates</li>
            <li>Notify you of delivery status and time windows</li>
            <li>Send subscription reminders and account updates</li>
            <li>Respond to customer care inquiries</li>
          </ul>

          <Typography variant="body1" paragraph>
            <strong>Data protection:</strong> We do not sell, rent, or share your phone number with third parties except as necessary to provide SMS messaging services through our SMS provider (Twilio).
          </Typography>

          <Typography variant="body1" paragraph>
            <strong>Data retention:</strong> We retain your phone number for as long as you remain opted-in to receive SMS messages or as required by law.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', mt: 3 }}>
            Your Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <ul>
            <li>Opt-out of SMS messages at any time by replying "STOP"</li>
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', mt: 3 }}>
            Contact Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            For privacy-related questions or requests, contact us at:
          </Typography>
          
          <Typography variant="body1" paragraph>
            Email: <Link href="mailto:alerts@chefpax.com" sx={{ color: '#2E7D32' }}>alerts@chefpax.com</Link><br />
            Website: <Link href="https://chefpax.com" sx={{ color: '#2E7D32' }}>chefpax.com</Link>
          </Typography>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              This privacy policy may be updated from time to time. We will notify you of any material changes.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
