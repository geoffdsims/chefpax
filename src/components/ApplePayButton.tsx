'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Apple } from '@mui/icons-material';

interface ApplePayButtonProps {
  cart: Array<{
    productId: string;
    name: string;
    priceCents: number;
    qty: number;
    photoUrl?: string;
    sizeOz?: number;
  }>;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    deliveryInstructions?: string;
  };
  total: number;
  isSubscription: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    PaymentRequest?: any;
  }
}

export default function ApplePayButton({
  cart,
  customer,
  total,
  isSubscription,
  onSuccess,
  onError
}: ApplePayButtonProps) {
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Apple Pay is supported
    const checkApplePaySupport = async () => {
      if (!window.PaymentRequest) {
        setIsApplePaySupported(false);
        return;
      }

      try {
        const paymentRequest = new window.PaymentRequest(
          [
            {
              supportedMethods: 'https://apple.com/apple-pay',
              data: {
                version: 3,
                merchantIdentifier: process.env.NEXT_PUBLIC_APPLE_MERCHANT_ID || 'merchant.com.chefpax.webapp',
                merchantCapabilities: ['supports3DS'],
                supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
                countryCode: 'US',
                currencyCode: 'USD'
              }
            }
          ],
          {
            total: {
              label: 'ChefPax Order',
              amount: {
                currency: 'USD',
                value: (total / 100).toFixed(2)
              }
            },
            displayItems: [
              ...cart.map(item => ({
                label: `${item.name} (x${item.qty})`,
                amount: {
                  currency: 'USD',
                  value: ((item.priceCents * item.qty) / 100).toFixed(2)
                }
              })),
              {
                label: 'Delivery Fee',
                amount: {
                  currency: 'USD',
                  value: '5.00'
                }
              }
            ]
          }
        );

        const canMakePayment = await paymentRequest.canMakePayment();
        setIsApplePaySupported(canMakePayment && canMakePayment.applePay);
      } catch (err) {
        console.log('Apple Pay not supported:', err);
        setIsApplePaySupported(false);
      }
    };

    checkApplePaySupport();
  }, [cart, total]);

  const handleApplePay = async () => {
    if (!window.PaymentRequest) {
      setError('Apple Pay is not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Create payment request
      const paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'ChefPax Order',
          amount: total,
        },
        displayItems: [
          ...cart.map(item => ({
            label: `${item.name} (x${item.qty})`,
            amount: item.priceCents * item.qty,
          })),
          {
            label: 'Delivery Fee',
            amount: 500,
          }
        ],
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        requestShipping: true,
      });

      // Check if Apple Pay is available
      const elements = stripe.elements();
      const prButton = elements.create('paymentRequestButton', {
        paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default',
            theme: 'dark',
            height: '48px',
          },
        },
      });

      // Handle payment method creation
      paymentRequest.on('paymentmethod', async (event: any) => {
        try {
          // Create payment intent on your server
          const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cart,
              customer: {
                ...customer,
                name: event.payerName,
                email: event.payerEmail,
                phone: event.payerPhone,
                address1: event.shippingAddress?.addressLine?.[0] || customer.address1,
                city: event.shippingAddress?.city || customer.city,
                state: event.shippingAddress?.region || customer.state,
                zip: event.shippingAddress?.postalCode || customer.zip,
              },
              paymentMethodId: event.paymentMethod.id,
              isSubscription: isSubscription && !!session,
            }),
          });

          const result = await response.json();

          if (result.error) {
            event.complete('fail');
            setError(result.error);
            onError?.(result.error);
          } else {
            event.complete('success');
            onSuccess?.();
            
            // Redirect to success page
            window.location.href = `/thanks?session_id=${result.sessionId}`;
          }
        } catch (err) {
          console.error('Apple Pay error:', err);
          event.complete('fail');
          setError('Payment failed. Please try again.');
          onError?.('Payment failed. Please try again.');
        }
      });

      // Create and mount the button
      const buttonContainer = document.getElementById('apple-pay-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        prButton.mount('#apple-pay-button');
      }

    } catch (err) {
      console.error('Apple Pay setup error:', err);
      setError('Apple Pay is not available');
      onError?.('Apple Pay is not available');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isApplePaySupported) {
    return null; // Don't show button if not supported
  }

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box
        id="apple-pay-button"
        sx={{
          width: '100%',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#333',
          },
          cursor: 'pointer'
        }}
        onClick={handleApplePay}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <>
            <Apple sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="button" sx={{ fontWeight: 'bold' }}>
              Pay with Apple Pay
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
