# ChefPax - Fresh Hydroponic Microgreens

ChefPax is a Next.js e-commerce platform for fresh hydroponic microgreens delivered to Austin. Features include product catalog, subscription management, order tracking, and customer accounts.

## 🌱 Features

- **Product Catalog** - Browse live microgreen trays and clamshells
- **Subscription Management** - Weekly recurring deliveries with discounts
- **Order Tracking** - Calendar-based order lifecycle tracking
- **Customer Accounts** - User authentication with Google OAuth
- **Admin Dashboard** - Manage products and subscription settings
- **Stripe Integration** - Secure payments and subscription billing
- **Delivery Scheduling** - Flexible delivery date selection

## 🚀 Quick Start

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Test Features Page

For testing new features and components:

```bash
# Navigate to test features page
http://localhost:3000/test-features
```

This page includes:
- Welcome Back Dashboard
- Order Tracking Calendar
- Enhanced Checkout Flow
- Account Creation Components

## 🔧 Admin Interface

### Subscription Settings Management

Access the admin interface to manage subscription settings:

```bash
# Admin subscription settings page
http://localhost:3000/admin/subscription-settings
```

**Features:**
- Enable/disable subscriptions per product
- Set custom subscription pricing
- Configure Stripe Price IDs
- Apply discount percentages
- Bulk update multiple products

**How to Use:**
1. Navigate to the admin page
2. Toggle subscriptions on/off for products
3. Set pricing (custom price or discount %)
4. Add Stripe Price IDs for proper billing
5. Changes save automatically

### Stripe Setup Guide

**Option A: Simple Discount**
- Keep using `STRIPE_SUB_PRICE_ID` environment variable
- Set discount percentage in admin interface
- Stripe handles billing, UI applies discount

**Option B: Per-Product Pricing (Recommended)**
1. Create Stripe Products for each microgreen variety
2. Create Recurring Prices (weekly/monthly) for each product
3. Copy Price IDs from Stripe Dashboard
4. Paste Price IDs in admin interface
5. Each product gets its own subscription pricing

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── subscription-settings/    # Admin interface
│   ├── api/                          # API routes
│   ├── cart/                         # Shopping cart
│   ├── shop/                         # Product catalog
│   └── test-features/                # Test components
├── components/
│   ├── CartDrawer.tsx
│   ├── ProductCard.tsx
│   ├── SubscriptionManager.tsx
│   └── SubscriptionSettingsManager.tsx
└── lib/
    ├── schema.ts                     # TypeScript types
    ├── stripe.ts                     # Stripe configuration
    └── mongo.ts                      # Database connection
```

## 🔑 Environment Setup

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions.

Required environment variables:
- `MONGODB_URI` - Database connection
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_SUB_PRICE_ID` - Global subscription price
- `NEXTAUTH_SECRET` - Authentication secret
- `GOOGLE_CLIENT_ID` - OAuth credentials

## 🛠️ API Endpoints

### Subscription Management
- `GET /api/admin/subscription-settings` - Fetch all products with settings
- `PUT /api/admin/subscription-settings` - Update single product settings
- `POST /api/admin/subscription-settings` - Bulk update products

### Customer Features
- `GET /api/welcome-back` - Personalized dashboard data
- `GET /api/orders/tracking` - Order tracking information
- `POST /api/subscriptions` - Create/update subscriptions

## 🎯 Subscription Flow

1. **Product Configuration** - Admin enables subscriptions and sets pricing
2. **Customer Selection** - Customer chooses products with subscription options
3. **Stripe Checkout** - Secure payment processing for subscriptions
4. **Order Management** - Automatic delivery scheduling and tracking
5. **Customer Portal** - Self-service subscription management

## 📱 Mobile Responsive

The application is fully responsive with:
- Touch-friendly product cards
- Mobile-optimized checkout flow
- Responsive admin interface
- Adaptive delivery scheduling

## 🚀 Deployment

Deploy on Vercel with automatic deployments from the main branch:

```bash
# Deploy to production
vercel --prod
```

The application supports:
- Domain-based routing (`chefpax.com` → homepage, `chefpax.shop` → shop)
- Server-side rendering with client-side hydration
- API routes for backend functionality
- Static asset optimization

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Material-UI Components](https://mui.com/)
- [NextAuth.js](https://next-auth.js.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test using the test-features page
5. Submit a pull request

## 📄 License

This project is proprietary to ChefPax.
