# ChefPax Authentication Setup Guide

## 🎯 Overview

ChefPax uses **NextAuth.js** with multiple authentication providers for a seamless customer experience.

---

## ✅ Currently Configured

### **Customer Sign-In Options:**
1. ✅ **Google OAuth** - Fully configured
2. ✅ **Facebook OAuth** - Fully configured (needs Vercel env vars)
3. ✅ **Email Magic Link** - Fully configured (uses SendGrid)
4. ⏳ **Apple Sign In** - Partially configured (needs Apple Developer account)

### **Admin Access:**
- ✅ **Google OAuth** - For @chefpax.com emails or ADMIN_EMAILS list
- ✅ **Role-based routing** - Separate customer and admin portals

---

## 📧 Email Magic Link (SendGrid)

### **How It Works:**
1. Customer enters their email address
2. NextAuth sends a magic link via SendGrid
3. Customer clicks the link to sign in
4. MongoDB stores the user account

### **Already Configured:**
```env
SENDGRID_API_KEY=<configured_in_env>
SENDGRID_FROM_EMAIL=hello@chefpax.com
MONGODB_URI=<configured_in_env>
```

### **MongoDB Collections (Auto-Created by NextAuth):**
When a user signs in with email, NextAuth automatically creates these collections:
- `users` - User accounts
- `accounts` - OAuth provider links
- `sessions` - Active sessions
- `verification_tokens` - Magic link tokens

### **Status:**
✅ **Ready to use!** No additional setup needed. The email form is now fully functional.

---

## 🍎 Apple Sign In Setup

### **Requirements:**
1. **Apple Developer Account** ($99/year)
2. **App ID** configuration
3. **Services ID** for web authentication
4. **Private Key** for JWT signing

### **Step-by-Step Setup:**

#### 1. **Create App ID**
- Go to: https://developer.apple.com/account/resources/identifiers/list
- Click **"+"** to create new identifier
- Select **"App IDs"** → Continue
- **Description:** ChefPax Web App
- **Bundle ID:** `com.chefpax.webapp`
- Enable **"Sign In with Apple"**
- Click **"Configure"** and set primary App ID
- Save

#### 2. **Create Services ID**
- Go to: https://developer.apple.com/account/resources/identifiers/list/serviceId
- Click **"+"** to create new identifier
- Select **"Services IDs"** → Continue
- **Identifier:** `com.chefpax.webapp.signin`
- **Description:** ChefPax Sign In
- Enable **"Sign In with Apple"**
- Click **"Configure"**:
  - **Primary App ID:** Select the App ID from step 1
  - **Web Domain:** `chefpax.com`
  - **Return URLs:** 
    - `https://www.chefpax.com/api/auth/callback/apple`
    - `https://chefpax.com/api/auth/callback/apple`
- Save

#### 3. **Create Private Key**
- Go to: https://developer.apple.com/account/resources/authkeys/list
- Click **"+"** to create new key
- **Key Name:** ChefPax Sign In Key
- Enable **"Sign In with Apple"**
- Click **"Configure"** and select your primary App ID
- Continue → Register → Download
- **Save the .p8 file securely!** (You can only download it once)
- Note the **Key ID** (e.g., `ABC123DEFG`)

#### 4. **Get Team ID**
- Go to: https://developer.apple.com/account
- Find **Team ID** in the top right (e.g., `XYZ987TEAM`)

#### 5. **Create Client Secret**

Apple Sign In requires a JWT token as the client secret. You'll need to generate this programmatically. Here's a Node.js script:

```javascript
// scripts/generate-apple-secret.js
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Configuration
const TEAM_ID = 'YOUR_TEAM_ID'; // From step 4
const KEY_ID = 'YOUR_KEY_ID'; // From step 3
const CLIENT_ID = 'com.chefpax.webapp.signin'; // Services ID from step 2
const PRIVATE_KEY_PATH = './AuthKey_YOUR_KEY_ID.p8'; // Downloaded .p8 file

// Generate JWT (valid for 6 months)
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
const clientSecret = jwt.sign(
  {
    iss: TEAM_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15777000, // 6 months
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  },
  privateKey,
  {
    algorithm: 'ES256',
    keyid: KEY_ID,
  }
);

console.log('Apple Client Secret (valid for 6 months):');
console.log(clientSecret);
```

Run it:
```bash
npm install jsonwebtoken
node scripts/generate-apple-secret.js
```

#### 6. **Add Environment Variables**

Add to `.env.local` and Vercel:
```env
APPLE_ID=com.chefpax.webapp.signin
APPLE_SECRET=<generated_jwt_from_step_5>
```

#### 7. **Verify Domain**

Apple requires domain verification:
- Download the verification file from Apple Developer portal
- Place it at: `https://www.chefpax.com/.well-known/apple-developer-domain-association.txt`
- In Next.js, create: `/public/.well-known/apple-developer-domain-association.txt`

---

## 🗄️ MongoDB User Management

### **Collections Used by NextAuth:**

#### 1. **`users` Collection**
Stores user account information:
```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "emailVerified": ISODate("2025-10-21T..."),
  "image": "https://...",
  "role": "customer" // Added by our custom callback
}
```

#### 2. **`accounts` Collection**
Links users to OAuth providers:
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "type": "oauth",
  "provider": "google",
  "providerAccountId": "1234567890",
  "access_token": "...",
  "expires_at": 1234567890,
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

#### 3. **`sessions` Collection**
Active user sessions:
```json
{
  "_id": ObjectId("..."),
  "sessionToken": "...",
  "userId": ObjectId("..."),
  "expires": ISODate("2025-11-21T...")
}
```

#### 4. **`verification_tokens` Collection**
Magic link tokens (auto-deleted after use):
```json
{
  "_id": ObjectId("..."),
  "identifier": "john@example.com",
  "token": "...",
  "expires": ISODate("2025-10-21T...")
}
```

### **No Manual Setup Required!**
NextAuth automatically creates these collections when the first user signs in.

---

## 🔐 Environment Variables Checklist

### **Required in `.env.local` and Vercel:**

```env
# MongoDB (already configured)
MONGODB_URI=mongodb+srv://chefpax-user:...
MONGODB_DB=chefpax

# NextAuth
NEXTAUTH_SECRET=<configured_in_env>
NEXTAUTH_URL=https://www.chefpax.com

# Google OAuth (already configured)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Facebook OAuth (needs to be added to Vercel)
FACEBOOK_CLIENT_ID=<configured_in_env>
FACEBOOK_CLIENT_SECRET=<configured_in_env>

# SendGrid Email (already configured)
SENDGRID_API_KEY=<your_sendgrid_api_key>
SENDGRID_FROM_EMAIL=hello@chefpax.com

# Apple Sign In (optional - needs setup)
APPLE_ID=com.chefpax.webapp.signin
APPLE_SECRET=<generated_jwt>

# Admin Access
ADMIN_EMAILS=geoff@chefpax.com
```

---

## 🚀 Testing the Setup

### **1. Test Email Magic Link Locally:**
```bash
npm run dev
```
- Go to: http://localhost:3000/auth/signin
- Click "Sign in with Email"
- Enter your email
- Check your inbox for the magic link
- Click the link to sign in

### **2. Test Facebook Login:**
- Add `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` to Vercel
- Deploy or redeploy your site
- Go to: https://www.chefpax.com/auth/signin
- Click "Continue with Facebook"
- Authorize the app
- You should be redirected to `/account`

### **3. Test Apple Sign In** (after setup):
- Add `APPLE_ID` and `APPLE_SECRET` to Vercel
- Deploy
- Go to: https://www.chefpax.com/auth/signin
- Click "Continue with Apple"
- Authorize with your Apple ID
- Sign in!

---

## 📊 Monitoring User Accounts

### **View Users in MongoDB:**
1. Go to: https://cloud.mongodb.com/
2. Select **ChefPax App** cluster
3. Click **"Browse Collections"**
4. Navigate to `users` collection
5. See all registered users

### **Query Examples:**

**Get all customers:**
```javascript
db.users.find({ role: { $ne: 'admin' } })
```

**Get users by provider:**
```javascript
db.accounts.aggregate([
  { $group: { _id: "$provider", count: { $sum: 1 } } }
])
```

**Get recent sign-ups:**
```javascript
db.users.find().sort({ _id: -1 }).limit(10)
```

---

## 🎨 UI/UX Features

### **Current Sign-In Page Features:**
✅ Modern, branded design with ChefPax logo
✅ Multiple sign-in options (Google, Facebook, Apple, Email)
✅ Email mode with back button for easy navigation
✅ Loading states and error handling
✅ Mobile-responsive layout
✅ Admin access link at the bottom

### **User Flow:**
1. User visits `/auth/signin`
2. Chooses sign-in method (OAuth or Email)
3. For email: Enters email → Receives magic link → Clicks to sign in
4. For OAuth: Redirects to provider → Authorizes → Returns to site
5. Redirects to `/account` (customers) or `/admin` (admins)

---

## 🔄 Session Management

### **Session Duration:**
- **JWT Strategy:** Sessions persist based on JWT expiration
- **Default:** 30 days
- **Refresh:** Automatic on page load if not expired

### **Sign Out:**
```javascript
import { signOut } from 'next-auth/react';

// Sign out and redirect to home
await signOut({ callbackUrl: '/' });
```

---

## 🛡️ Security Features

✅ **HTTPS Only** - All auth cookies are secure in production
✅ **CSRF Protection** - NextAuth handles CSRF tokens automatically
✅ **JWT Signing** - All tokens are cryptographically signed
✅ **Email Verification** - Magic links expire after 24 hours
✅ **Role-Based Access** - Admin routes protected by middleware
✅ **Secret Scanning** - GitHub prevents accidental credential commits

---

## 📝 Next Steps

### **Immediate:**
1. ✅ Email magic link is ready (fully functional now!)
2. ⏳ Add Facebook env vars to Vercel
3. ⏳ Test Facebook login in production

### **Optional (Apple Sign In):**
1. Purchase Apple Developer account ($99/year)
2. Follow Apple Sign In setup steps above
3. Generate client secret JWT
4. Add to Vercel and test

---

## 📞 Support Resources

- **NextAuth Docs:** https://next-auth.js.org/
- **Apple Sign In Guide:** https://developer.apple.com/sign-in-with-apple/
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **SendGrid Dashboard:** https://app.sendgrid.com/

---

Last updated: October 21, 2025

