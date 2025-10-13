import { Box, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="error" sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
          403
        </Typography>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You don't have permission to access this page. Admin access is required.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            color="primary"
          >
            Go Home
          </Button>
          <Button
            component={Link}
            href="/api/auth/signout"
            variant="outlined"
            color="secondary"
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

