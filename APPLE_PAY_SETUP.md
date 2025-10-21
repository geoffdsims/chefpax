# Apple Pay Integration for ChefPax

## 💳 Overview

This guide covers setting up Apple Pay as a payment method alongside Stripe on ChefPax.

---

## ✅ Prerequisites

- [x] Apple Developer Account
- [x] Stripe Account (you already have this)
- [x] Domain verification files in place
- [x] HTTPS enabled (required for Apple Pay)

---

## 🍎 Apple Developer Portal Setup

### **1. Create Merchant ID**

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** button
3. Select **"Merchant IDs"**
4. Click **"Continue"**
5. Fill in:
   - **Description:** `ChefPax Payments`
   - **Identifier:** `merchant.com.chefpax.webapp`
6. Click **"Continue"** → **"Register"**

✅ **Save this:** `merchant.com.chefpax.webapp`

---

### **2. Create Payment Processing Certificate**

#### **Generate CSR (Certificate Signing Request):**

On your Mac:
1. Open **Keychain Access** (Applications → Utilities)
2. Go to: **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Fill in:
   - **User Email Address:** `geoff@chefpax.com`
   - **Common Name:** `ChefPax Apple Pay Processing`
   - **CA Email Address:** Leave blank
   - **Request is:** ✅ **Saved to disk**
   - ✅ Check **"Let me specify key pair information"**
4. Click **"Continue"**
5. Key configuration:
   - **Key Size:** `2048 bits`
   - **Algorithm:** `RSA`
6. Click **"Continue"**
7. Save as: `ChefPaxApplePay.certSigningRequest`

#### **Upload CSR to Apple:**

1. Go back to Apple Developer portal
2. Click on your **Merchant ID** (`merchant.com.chefpax.webapp`)
3. Under "Apple Pay Payment Processing Certificate", click **"Create Certificate"**
4. Click **"Choose File"** and upload your `.certSigningRequest`
5. Click **"Continue"**
6. Download the certificate (`.cer` file)
7. Double-click the `.cer` file to install it in Keychain Access

---

### **3. Verify Domain**

1. Still on your Merchant ID page in Apple Developer portal
2. Under "Merchant Domains", click **"Add Domain"**
3. Enter: `chefpax.com` (no www, no https://)
4. Click **"Save"**
5. Download the verification file: `apple-developer-merchantid-domain-association`

#### **Add to your project:**

```bash
cd /Users/geoffsims/Documents/projects/chefpax

# Create .well-known directory if it doesn't exist
mkdir -p public/.well-known

# Move the verification file there
mv ~/Downloads/apple-developer-merchantid-domain-association public/.well-known/

# Commit and push
git add public/.well-known/apple-developer-merchantid-domain-association
git commit -m "feat: Add Apple Pay domain verification"
git push origin main
```

Wait for Vercel to deploy, then verify it's accessible:
```bash
curl https://www.chefpax.com/.well-known/apple-developer-merchantid-domain-association
```

6. Go back to Apple Developer portal
7. Click **"Verify"** next to your domain
8. ✅ It should show "Verified"

---

## 💳 Stripe + Apple Pay Integration

Good news! **Stripe already supports Apple Pay**. You just need to enable it.

### **1. Enable Apple Pay in Stripe**

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Find **"Apple Pay"**
3. Click **"Turn on"**
4. Add your domain: `chefpax.com`

### **2. Add Apple Pay Domain to Stripe**

```bash
# Install Stripe CLI if you haven't already
# macOS:
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Add domain for Apple Pay
stripe apple-pay register-domain -d chefpax.com
```

Or via Stripe Dashboard:
1. Go to: https://dashboard.stripe.com/settings/payments/apple_pay
2. Click **"Add Domain"**
3. Enter: `chefpax.com`
4. Stripe will verify automatically

---

## 🛠️ Frontend Integration

Apple Pay works through Stripe's Payment Request API. Let me create the component:

### **Environment Variables**

Already configured! You're using:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51S9g3D3kcvYyat13VnUI...
STRIPE_SECRET_KEY=sk_live_51S9g3D3kcvYyat134bUnNL...
```

---

## 🎨 Add Apple Pay Button

The Apple Pay button will automatically appear on Safari/iOS when:
1. User is on a device that supports Apple Pay
2. User has a card set up in Wallet
3. Your domain is verified

### **How it Works:**

When a customer clicks "Checkout" on your cart page:
1. If on Safari/iOS → Show Apple Pay button option
2. If Apple Pay button clicked → Native Apple Pay sheet appears
3. User authenticates with Face ID/Touch ID
4. Payment processed through Stripe
5. Order confirmed!

---

## 📱 Testing Apple Pay

### **Test on Real Device (Recommended):**

1. Use Safari on iPhone or Mac with Touch ID/Face ID
2. Make sure you have a test card in Apple Wallet:
   - **Stripe Test Card:** `4242 4242 4242 4242`
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
3. Go to: `https://www.chefpax.com/cart`
4. Add items and click checkout
5. Apple Pay button should appear
6. Complete the purchase

### **Stripe Test Mode:**

During development, Stripe processes Apple Pay in test mode automatically when using test keys.

---

## 🔐 Security Notes

✅ **All handled by Apple + Stripe:**
- Card data never touches your servers
- Tokenization handled by Apple Pay
- PCI compliance maintained
- Fraud detection by Stripe

---

## 💡 Why Apple Pay + Stripe is Perfect

1. **No additional fees** - Same Stripe rate (2.9% + 30¢)
2. **Higher conversion** - 1-click checkout
3. **More secure** - Biometric authentication
4. **Mobile optimized** - Perfect for iOS users
5. **Easy integration** - Stripe handles everything

---

## 📊 Monitoring Apple Pay Transactions

### **In Stripe Dashboard:**

1. Go to: https://dashboard.stripe.com/payments
2. Filter by payment method: **"Apple Pay"**
3. See all Apple Pay transactions

### **In Your Code:**

Apple Pay transactions will have:
```javascript
payment_method_details: {
  type: 'card',
  card: {
    wallet: {
      type: 'apple_pay'
    }
  }
}
```

---

## ✅ Setup Checklist

- [ ] Created Merchant ID in Apple Developer portal
- [ ] Generated and uploaded CSR
- [ ] Downloaded and installed payment processing certificate
- [ ] Added domain verification file to `/public/.well-known/`
- [ ] Verified domain in Apple Developer portal
- [ ] Enabled Apple Pay in Stripe dashboard
- [ ] Registered domain with Stripe for Apple Pay
- [ ] Tested Apple Pay button appears on Safari/iOS
- [ ] Completed test transaction
- [ ] Verified transaction appears in Stripe dashboard

---

## 🎯 What Customers Will See

### **On iOS Safari / Mac Safari:**
- "Pay with Apple Pay" button appears at checkout
- Click button → Native Apple Pay sheet
- Face ID / Touch ID authentication
- "Done" - Order confirmed!

### **On Other Browsers:**
- Apple Pay button doesn't appear
- Shows standard Stripe payment form (Card, Google Pay, etc.)

---

## 🔧 Troubleshooting

### **Apple Pay button not showing:**
1. Check you're using Safari (iOS or macOS)
2. Verify device supports Apple Pay
3. Ensure user has cards in Wallet
4. Confirm domain is verified in both Apple and Stripe
5. Check HTTPS is enabled (required)

### **"Cannot read property 'paymentRequest' of undefined":**
- Stripe.js not loaded yet
- Use a loading state while Stripe initializes

### **Domain verification failed:**
- Ensure verification file is accessible at the URL
- Check file doesn't have `.txt` extension
- Verify no redirects on the `.well-known` path

---

## 📞 Resources

- **Apple Pay Developer:** https://developer.apple.com/apple-pay/
- **Stripe Apple Pay Guide:** https://stripe.com/docs/apple-pay
- **Stripe Payment Request API:** https://stripe.com/docs/js/payment_request_button

---

**Your existing Stripe integration already supports Apple Pay!** The button will automatically appear when conditions are met. 🎉

Last updated: October 21, 2025

