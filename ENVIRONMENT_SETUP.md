# Environment Setup Guide

To get the full functionality working (user accounts, subscriptions, order tracking), you need to create a `.env.local` file in the root directory with the following variables:

## Required Environment Variables

Create a file called `.env.local` in the root directory with:

```bash
# MongoDB Configuration
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/chefpax?retryWrites=true&w=majority"
MONGODB_DB="chefpax"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"         # change to https://chefpax.com in prod
NEXTAUTH_SECRET="long_random_string"         # generate with: openssl rand -base64 32

# Google OAuth (for user accounts)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_SUB_PRICE_ID="price_your_subscription_price_id"  # Create in Stripe Dashboard

# Business Configuration
CHEFPAX_CITY="Austin"
CHEFPAX_DELIVERY_FEE_CENTS="500"
CHEFPAX_CUTOFF_DOW="3"
CHEFPAX_CUTOFF_TIME="18:00"
CHEFPAX_DELIVERY_DOW="5"

# Base URL for development/production
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
```

## Setup Steps

### 1. MongoDB Atlas
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string and add to `MONGODB_URI`

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (development)
   - `https://chefpax.com/api/auth/callback/google` (production)
6. Copy Client ID and Secret to `.env.local`

### 3. Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Create a subscription product:
   - Product: "ChefPax Weekly Subscription"
   - Price: $20/week (or your preferred amount)
   - Copy the price ID to `STRIPE_SUB_PRICE_ID`
4. Set up webhook endpoint: `/api/stripe/webhook`
5. Enable Customer Portal in Stripe Dashboard

### 4. Generate NextAuth Secret
```bash
openssl rand -base64 32
```

## Quick Development Setup

For immediate testing without full setup:

```bash
# Create minimal .env.local
echo 'MONGODB_URI=""' >> .env.local
echo 'NEXTAUTH_SECRET="dev-secret-key"' >> .env.local
echo 'NEXT_PUBLIC_BASE_URL="http://localhost:3001"' >> .env.local
```

The app will work with calculated inventory but won't have user accounts or subscriptions.

## Features Enabled

With full setup, you get:
- ✅ User accounts with Google OAuth
- ✅ Weekly subscriptions via Stripe
- ✅ Order history and account management
- ✅ Customer portal for billing management
- ✅ Real-time inventory tracking
- ✅ Admin dashboard for order management

## Production Deployment

When ready for production:
1. Update `NEXTAUTH_URL` to `https://chefpax.com`
2. Update `NEXT_PUBLIC_BASE_URL` to `https://chefpax.com`
3. Add production Google OAuth redirect URI
4. Use live Stripe keys instead of test keys