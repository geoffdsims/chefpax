'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { Google, AdminPanelSettings } from '@mui/icons-material';
import Image from 'next/image';

function AdminLoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const error = searchParams.get('error');

  useEffect(() => {
    // If already logged in as admin, redirect to admin dashboard
    if (session?.user) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl });
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Image
                  src="/logo.png"
                  alt="ChefPax"
                  width={120}
                  height={120}
                  priority
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <AdminPanelSettings color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h4" fontWeight="bold">
                  Admin Portal
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Sign in to access the ChefPax management dashboard
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error === 'AccessDenied'
                  ? 'You do not have admin access. Please contact support.'
                  : 'An error occurred during sign in. Please try again.'}
              </Alert>
            )}

            {/* Sign In Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleGoogleSignIn}
              startIcon={<Google />}
              sx={{
                py: 1.5,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #663a8f 100%)',
                }
              }}
            >
              Sign in with Google
            </Button>

            {/* Info Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Admin Access Only</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Only authorized ChefPax team members can access this portal<br />
                • Use your @chefpax.com Google account or authorized email<br />
                • Contact IT if you need admin access
              </Typography>
            </Box>

            {/* Customer Portal Link */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Not an admin?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/shop')}
                size="small"
              >
                Go to Customer Shop
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="caption"
          color="white"
          sx={{ display: 'block', textAlign: 'center', mt: 3, opacity: 0.8 }}
        >
          © 2025 ChefPax LLC. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}

