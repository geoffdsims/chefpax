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
  Divider,
  TextField,
  IconButton
} from '@mui/material';
import { Google, Apple, Email, Facebook, ArrowBack } from '@mui/icons-material';
import Image from 'next/image';
import React from 'react';

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

  const [email, setEmail] = React.useState('');
  const [isEmailMode, setIsEmailMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    await signIn('email', { email, callbackUrl });
    setIsSubmitting(false);
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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

              {!isEmailMode ? (
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => setIsEmailMode(true)}
                  startIcon={<Email />}
                  sx={{ py: 1.5 }}
                >
                  Sign in with Email
                </Button>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => setIsEmailMode(false)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ArrowBack />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      Back to other options
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEmailSignIn();
                      }
                    }}
                    disabled={isSubmitting}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleEmailSignIn}
                    disabled={isSubmitting || !email}
                    sx={{ py: 1.5 }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Send Magic Link'
                    )}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    We'll send you a secure login link via email
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Info Box */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 1,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>New to ChefPax?</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Sign in with any method above to create an account<br />
                • Access your order history and subscriptions<br />
                • Track your microgreens delivery<br />
                • Manage your preferences
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

