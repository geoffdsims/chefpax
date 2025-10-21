# Apple Sign In Setup for ChefPax

## 🍎 Quick Setup Guide

Since you already have an Apple Developer account, this should take about 15 minutes.

---

## Step 1: Create App ID

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click the **"+"** button (top left)
3. Select **"App IDs"** → Click **Continue**
4. Select **"App"** → Click **Continue**
5. Fill in the form:
   - **Description:** `ChefPax Web Application`
   - **Bundle ID:** `com.chefpax.webapp` (or use your existing bundle ID if you have one)
   - **Platform:** Check **iOS/macOS**
6. Scroll down to **Capabilities**
7. Check **"Sign In with Apple"**
8. Click **"Edit"** next to Sign In with Apple
   - Select **"Enable as a primary App ID"**
   - Click **"Save"**
9. Click **"Continue"** → Click **"Register"**

✅ **Copy your Bundle ID** (e.g., `com.chefpax.webapp`) - you'll need it!

---

## Step 2: Create Services ID (Web Auth)

1. Go back to: https://developer.apple.com/account/resources/identifiers/list
2. Click the **"+"** button
3. Select **"Services IDs"** → Click **Continue**
4. Fill in the form:
   - **Description:** `ChefPax Sign In`
   - **Identifier:** `com.chefpax.webapp.signin`
   - ✅ **Important:** This must be different from your App ID!
5. Check **"Sign In with Apple"**
6. Click **"Configure"** next to Sign In with Apple
7. In the configuration dialog:
   - **Primary App ID:** Select `ChefPax Web Application` (from Step 1)
   - **Web Domain:** `chefpax.com` (no https://)
   - Click **"Add"** under Return URLs
   - Add both:
     - `https://www.chefpax.com/api/auth/callback/apple`
     - `https://chefpax.com/api/auth/callback/apple`
   - Click **"Next"** → **"Done"**
8. Click **"Continue"** → Click **"Register"**

✅ **Copy your Services ID** (e.g., `com.chefpax.webapp.signin`) - this is your `APPLE_ID`!

---

## Step 3: Create a Private Key

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click the **"+"** button
3. Fill in the form:
   - **Key Name:** `ChefPax Sign In Key`
4. Check **"Sign In with Apple"**
5. Click **"Configure"** next to Sign In with Apple
   - **Primary App ID:** Select `ChefPax Web Application`
   - Click **"Save"**
6. Click **"Continue"** → Click **"Register"**
7. Click **"Download"** - This downloads a `.p8` file
   - ⚠️ **IMPORTANT:** You can only download this ONCE! Save it securely!
   - The file is named something like: `AuthKey_ABC123DEFG.p8`
8. ✅ **Copy your Key ID** (shown on the page, e.g., `ABC123DEFG`)

**Save these files:**
```bash
# Create a secure directory for the key
mkdir -p ~/chefpax-apple-keys
mv ~/Downloads/AuthKey_*.p8 ~/chefpax-apple-keys/
chmod 600 ~/chefpax-apple-keys/AuthKey_*.p8
```

---

## Step 4: Get Your Team ID

1. Go to: https://developer.apple.com/account
2. Look in the top right corner under your name
3. ✅ **Copy your Team ID** (e.g., `XYZ9876ABC`)

---

## Step 5: Verify Domain Ownership

Apple requires you to prove you own `chefpax.com`:

1. Go to: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click on your **Services ID** (`ChefPax Sign In`)
3. Click **"Configure"** next to Sign In with Apple
4. Click **"Download"** next to your domain
5. This downloads a file named: `apple-developer-domain-association.txt`

**Add to your Next.js project:**
```bash
# Create the .well-known directory
mkdir -p /Users/geoffsims/Documents/projects/chefpax/public/.well-known

# Move the file there
mv ~/Downloads/apple-developer-domain-association.txt /Users/geoffsims/Documents/projects/chefpax/public/.well-known/
```

This file will be accessible at:
`https://www.chefpax.com/.well-known/apple-developer-domain-association.txt`

---

## Step 6: Generate Client Secret (JWT)

Apple requires a JWT token as the client secret. Let's create a script to generate it:

```bash
cd /Users/geoffsims/Documents/projects/chefpax
mkdir -p scripts
nano scripts/generate-apple-secret.js
```

**Paste this code:**

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// ⚠️ REPLACE THESE WITH YOUR VALUES FROM STEPS 1-4
const TEAM_ID = 'YOUR_TEAM_ID';        // From Step 4 (e.g., 'XYZ9876ABC')
const KEY_ID = 'YOUR_KEY_ID';          // From Step 3 (e.g., 'ABC123DEFG')
const CLIENT_ID = 'com.chefpax.webapp.signin';  // Services ID from Step 2
const PRIVATE_KEY_PATH = path.join(process.env.HOME, 'chefpax-apple-keys/AuthKey_YOUR_KEY_ID.p8');

// Generate JWT (valid for 6 months)
try {
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  
  const clientSecret = jwt.sign(
    {
      iss: TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000, // 6 months (max allowed)
      aud: 'https://appleid.apple.com',
      sub: CLIENT_ID,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: KEY_ID,
    }
  );

  console.log('\n✅ Apple Client Secret Generated Successfully!\n');
  console.log('Copy this secret and add it to your .env.local and Vercel:\n');
  console.log('APPLE_SECRET=' + clientSecret);
  console.log('\n⚠️ This secret is valid for 6 months. Regenerate before it expires.');
  console.log('📅 Expires:', new Date(Date.now() + 15777000 * 1000).toLocaleDateString());
  
} catch (error) {
  console.error('❌ Error generating client secret:', error.message);
  console.log('\n💡 Make sure:');
  console.log('1. You replaced TEAM_ID, KEY_ID, and CLIENT_ID with your values');
  console.log('2. The PRIVATE_KEY_PATH points to your .p8 file');
  console.log('3. The .p8 file exists and is readable');
}
```

**Run the script:**
```bash
# Install jsonwebtoken if not already installed
npm install jsonwebtoken

# Run the generator
node scripts/generate-apple-secret.js
```

✅ **Copy the generated `APPLE_SECRET`** - it's a long JWT token!

---

## Step 7: Add Environment Variables

### **Local (.env.local):**
```bash
cd /Users/geoffsims/Documents/projects/chefpax
nano .env.local
```

**Add these lines:**
```env
# Apple Sign In
APPLE_ID=com.chefpax.webapp.signin
APPLE_SECRET=<the_long_jwt_from_step_6>
```

### **Vercel:**
Go to: https://vercel.com/geoffdsims/chefpax/settings/environment-variables

Add:
- `APPLE_ID` = `com.chefpax.webapp.signin`
- `APPLE_SECRET` = `<the_long_jwt_from_step_6>`

---

## Step 8: Commit Domain Verification File

```bash
cd /Users/geoffsims/Documents/projects/chefpax
git add public/.well-known/apple-developer-domain-association.txt
git commit -m "feat: Add Apple domain verification for Sign In with Apple"
git push origin main
```

Wait for Vercel to deploy, then verify it's accessible:
```bash
curl https://www.chefpax.com/.well-known/apple-developer-domain-association.txt
```

You should see Apple's verification content.

---

## Step 9: Verify Apple Configuration

1. Go back to: https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click on **ChefPax Sign In**
3. Click **"Configure"** next to Sign In with Apple
4. Click **"Verify"** next to `chefpax.com`
5. ✅ It should show "Verified"

---

## Step 10: Test Apple Sign In! 🎉

1. Go to: https://www.chefpax.com/auth/signin
2. Click **"Continue with Apple"**
3. Sign in with your Apple ID
4. Choose whether to share your email
5. You'll be redirected back to ChefPax, signed in!

---

## 🔍 Troubleshooting

### **"Invalid client" error:**
- Double-check your `APPLE_ID` matches your Services ID exactly
- Make sure `APPLE_SECRET` JWT hasn't expired (6 months max)

### **"Domain not verified" error:**
- Verify the `.well-known` file is accessible at the URL
- Check Apple Developer portal shows domain as "Verified"

### **"Invalid redirect_uri" error:**
- Make sure you added both URLs to your Services ID:
  - `https://www.chefpax.com/api/auth/callback/apple`
  - `https://chefpax.com/api/auth/callback/apple`

### **"Invalid JWT" error:**
- Regenerate the client secret using the script
- Make sure TEAM_ID, KEY_ID, and CLIENT_ID are correct
- Verify the .p8 file path is correct

---

## 📋 Quick Reference

**What you need:**

| Item | Where to Find | Example |
|------|---------------|---------|
| **Team ID** | https://developer.apple.com/account | `XYZ9876ABC` |
| **Key ID** | When creating private key | `ABC123DEFG` |
| **Services ID** | After creating Services ID | `com.chefpax.webapp.signin` |
| **Private Key** | Download after creating key | `AuthKey_ABC123DEFG.p8` |
| **Client Secret** | Generate with script | `eyJhbGciOiJFUzI1NiIsInR5c...` |

---

## 🔄 Regenerating Client Secret

The JWT expires after 6 months. To regenerate:

```bash
cd /Users/geoffsims/Documents/projects/chefpax
node scripts/generate-apple-secret.js
```

Update the new `APPLE_SECRET` in:
1. `.env.local`
2. Vercel environment variables

---

## ✅ Checklist

- [ ] Created App ID with Sign In with Apple enabled
- [ ] Created Services ID with web domains configured
- [ ] Created Private Key and downloaded .p8 file
- [ ] Noted Team ID, Key ID, Services ID
- [ ] Added domain verification file to `/public/.well-known/`
- [ ] Generated client secret JWT
- [ ] Added `APPLE_ID` and `APPLE_SECRET` to `.env.local`
- [ ] Added `APPLE_ID` and `APPLE_SECRET` to Vercel
- [ ] Committed and pushed domain verification file
- [ ] Verified domain in Apple Developer portal
- [ ] Tested Apple Sign In on production

---

**Once complete, all authentication methods will be live!** 🚀

- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Apple Sign In
- ✅ Email Magic Link

---

Last updated: October 21, 2025

