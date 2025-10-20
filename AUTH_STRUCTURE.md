# 🔐 ChefPax Authentication Structure

## Overview

ChefPax has a **two-tier authentication system** with separate flows for customers and administrators.

## 🛒 Customer Authentication (Front Door)

### Public Routes
- `/` - Homepage
- `/shop` - Product catalog
- `/cart` - Shopping cart
- `/how-it-works` - Information page

### Customer Sign-In Options
1. **Google OAuth** - Quick sign-in with Google account
2. **Apple Sign-In** - For iOS users
3. **Email Magic Link** - Passwordless email authentication

### Customer Protected Routes
- `/account` - Customer dashboard
  - Order history
  - Subscriptions
  - Profile settings
  - Loyalty points

### Access
- **All customers** can access these routes after signing in with any method
- No special permissions required
- Automatic account creation on first sign-in

## 🔧 Admin Authentication (Back Door)

### Admin Portal
- `/admin/login` - Custom admin sign-in page
- **Only for authorized ChefPax team members**

### Admin Sign-In Options
- **Google OAuth only** - Must use authorized email address

### Admin Authorization
Access is granted to users whose email:
1. Ends with `@chefpax.com` domain
2. **OR** is listed in the `ADMIN_EMAILS` environment variable

Example `.env.local`:
```env
ADMIN_EMAILS=geoff@example.com,john@example.com,admin@chefpax.com
```

### Admin Protected Routes
- `/admin` - Admin dashboard (home)
- `/admin/production` - Production tasks & grow schedule
- `/admin/iot-monitoring` - IoT sensor dashboard
- `/admin/marketing-analytics` - Marketing & revenue analytics
- `/admin/orders` - Order management
- `/admin/inventory` - Inventory & capacity
- `/admin/delivery` - Delivery management
- `/admin/customers` - Customer profiles
- `/admin/settings` - System configuration

### Security Features
1. **Middleware Protection** - All `/admin/*` routes are protected
2. **Custom Login Page** - Branded admin portal at `/admin/login`
3. **Auto-Redirect** - Non-authenticated users redirected to login
4. **Role-Based Access** - JWT tokens include `role` field
5. **Sign-Out** - Secure sign-out with redirect to admin login

## 🔒 Security Implementation

### Middleware (`src/middleware.ts`)
- Protects all `/admin/*` routes except `/admin/login`
- Checks JWT token for authentication
- Verifies admin email authorization
- Redirects unauthorized users to `/unauthorized`

### Auth Configuration (`src/lib/authOptions.ts`)
- Custom pages for admin login
- JWT callback adds `role` to token (`admin` or `customer`)
- Session callback exposes user `id` and `role`
- Sign-in callback validates admin emails

### Environment Variables
Required in `.env.local`:
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Authorization
ADMIN_EMAILS=geoff@example.com,admin@chefpax.com

# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB=chefpax

# Email (for magic links)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@chefpax.com
```

## 📱 User Experience

### For Customers
1. Browse `/shop` without signing in
2. Add items to cart
3. At checkout, prompted to sign in with Google/Apple/Email
4. Account automatically created
5. Complete purchase
6. Access `/account` for order history

### For Admins
1. Navigate to `/admin` (any admin route)
2. Automatically redirected to `/admin/login`
3. Sign in with authorized Google account
4. Access admin dashboard
5. Navigate between admin tools
6. Sign out when done

## 🎯 Benefits

✅ **Clear Separation** - Customer and admin flows are completely separate
✅ **Secure** - Admin routes protected by middleware + email verification
✅ **User-Friendly** - Custom branded login pages for each audience
✅ **Flexible** - Easy to add/remove admin emails via environment variable
✅ **Professional** - Enterprise-grade authentication with NextAuth.js

## 🚀 Adding New Admins

To grant admin access to a new team member:

1. **Option 1: Company Email (Recommended)**
   - Have them sign in with `@chefpax.com` email
   - Automatically granted admin access

2. **Option 2: Environment Variable**
   - Add their email to `ADMIN_EMAILS` in `.env.local`:
     ```env
     ADMIN_EMAILS=existing@example.com,newemail@example.com
     ```
   - Restart the development server
   - In production, update environment variables in Vercel

## 🔧 Troubleshooting

### "Access Denied" Error
- Check that email is either `@chefpax.com` or in `ADMIN_EMAILS`
- Verify `ADMIN_EMAILS` format (comma-separated, no spaces)
- Check environment variables are loaded

### Redirect Loop
- Ensure `/admin/login` is excluded from middleware protection
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Can't Sign In
- Verify Google OAuth credentials are correct
- Check `NEXTAUTH_URL` matches your domain
- Review browser console for errors

## 📝 Development vs Production

### Development (`localhost:3000`)
```env
NEXTAUTH_URL=http://localhost:3000
```

### Production (Vercel)
```env
NEXTAUTH_URL=https://www.chefpax.com
```

**Important:** Vercel automatically sets some environment variables. Always verify in the Vercel dashboard that all required env vars are present.

---

**🎉 Your authentication system is now production-ready with clear separation between customer and admin access!**

