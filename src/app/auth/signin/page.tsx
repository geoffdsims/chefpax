'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Google, Apple, Email, AdminPanelSettings, Facebook } from '@mui/icons-material';
import Image from 'next/image';

function SignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';
  const error = searchParams.get('error');

  useEffect(() => {
    // If already logged in, redirect appropriately
    if (session?.user) {
      const isAdmin = session.user.role === 'admin';
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push(callbackUrl);
      }
    }
  }, [session, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl });
  };

  const handleFacebookSignIn = async () => {
    await signIn('facebook', { callbackUrl });
  };

  const handleAppleSignIn = async () => {
    await signIn('apple', { callbackUrl });
  };

  const handleEmailSignIn = async () => {
    await signIn('email', { callbackUrl });
  };

  const handleAdminSignIn = () => {
    router.push('/admin/login');
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
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome to ChefPax
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account to manage orders and subscriptions
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error === 'AccessDenied'
                  ? 'You do not have access to this account. Please try a different sign-in method.'
                  : 'An error occurred during sign in. Please try again.'}
              </Alert>
            )}

            {/* Sign In Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleGoogleSignIn}
                startIcon={<Google />}
                sx={{
                  py: 1.5,
                  background: '#4285f4',
                  '&:hover': {
                    background: '#357ae8',
                  }
                }}
              >
                Continue with Google
              </Button>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleFacebookSignIn}
                startIcon={<Facebook />}
                sx={{
                  py: 1.5,
                  background: '#1877f2',
                  '&:hover': {
                    background: '#166fe5',
                  }
                }}
              >
                Continue with Facebook
              </Button>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleAppleSignIn}
                startIcon={<Apple />}
                sx={{
                  py: 1.5,
                  background: '#000',
                  '&:hover': {
                    background: '#333',
                  }
                }}
              >
                Continue with Apple
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleEmailSignIn}
                startIcon={<Email />}
                sx={{ py: 1.5 }}
              >
                Sign in with Email
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            {/* Admin Access */}
            <Button
              variant="text"
              fullWidth
              onClick={handleAdminSignIn}
              startIcon={<AdminPanelSettings />}
              sx={{
                py: 1,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Admin Access
            </Button>

            {/* Info Box */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 1,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>New to ChefPax?</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Sign in with any method above to create an account<br />
                • Access your order history and subscriptions<br />
                • Track your microgreens delivery<br />
                • Manage your preferences and loyalty points
              </Typography>
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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <SignInContent />
    </Suspense>
  );
}

