"use client";

import { Box, Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function DataDeletionPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Deletion Instructions
        </Typography>
        
        <Typography variant="body1" paragraph>
          ChefPax respects your privacy and provides multiple ways to delete your personal data.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          How to Delete Your Data
        </Typography>

        <List>
          <ListItem>
            <ListItemText 
              primary="Option 1: Through Your Account"
              secondary={
                <Box>
                  <Typography variant="body2" component="div">
                    1. Log into your ChefPax account at{' '}
                    <a href="/account" target="_blank" rel="noopener noreferrer">
                      https://chefpax.com/account
                    </a>
                  </Typography>
                  <Typography variant="body2" component="div">
                    2. Navigate to Account Settings
                  </Typography>
                  <Typography variant="body2" component="div">
                    3. Click "Delete Account" button
                  </Typography>
                  <Typography variant="body2" component="div">
                    4. Confirm the deletion
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="Option 2: Email Request"
              secondary={
                <Box>
                  <Typography variant="body2" component="div">
                    Send an email to{' '}
                    <a href="mailto:privacy@chefpax.com">privacy@chefpax.com</a>{' '}
                    with the subject "Data Deletion Request"
                  </Typography>
                  <Typography variant="body2" component="div">
                    Include your registered email address and we will delete your data within 30 days.
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="Option 3: Facebook Data Deletion"
              secondary={
                <Box>
                  <Typography variant="body2" component="div">
                    If you logged in through Facebook, you can also request data deletion through Facebook's data deletion tool.
                  </Typography>
                  <Typography variant="body2" component="div">
                    Visit your Facebook Settings → Apps and Websites → ChefPax → Remove
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          What Data We Delete
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="Personal information (name, email, address)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Order history (anonymized for business records)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Subscription preferences" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Push notification tokens" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Account preferences and settings" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          Important Notes
        </Typography>

        <Typography variant="body2" paragraph>
          • Data deletion is permanent and cannot be undone
        </Typography>
        <Typography variant="body2" paragraph>
          • We may retain anonymized business records for accounting and legal purposes
        </Typography>
        <Typography variant="body2" paragraph>
          • Deletion requests are processed within 30 days
        </Typography>
        <Typography variant="body2" paragraph>
          • You will receive a confirmation email once deletion is complete
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          Privacy Policy
        </Typography>

        <Typography variant="body2">
          For more information about how we handle your data, please read our{' '}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          Contact Us
        </Typography>

        <Typography variant="body2">
          If you have any questions about data deletion, please contact us at{' '}
          <a href="mailto:privacy@chefpax.com">privacy@chefpax.com</a>
        </Typography>
      </Paper>
    </Container>
  );
}
