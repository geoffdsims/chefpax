# Stripe Product Catalog Setup

## 📦 Overview

ChefPax uses a **size-aware pricing system** in Stripe:
- **10×20 trays:** $30 one-time, $28/week, $110/month
- **5×5 trays:** $13 one-time, $12/week (premium herbs)
- **Bundles:** Discounted multi-product packages

## 🚀 Running the Stripe Seeder

### **One-Time Setup:**

This script creates all products and prices in your Stripe account.

```bash
# Make sure you have your Stripe secret key:
export STRIPE_SECRET_KEY=sk_live_...

# Run the seeder:
node scripts/seed-stripe-products.js
```

### **What It Does:**

1. **Creates 11 Individual Products:**
   - 7 core varieties (10×20 only)
   - 4 premium herbs (5×5 only)
   - 1 product with both sizes (Amaranth)

2. **Creates Size-Specific Prices:**
   - Each size gets 3 price points: one-time, weekly, monthly
   - Uses lookup keys like: `sunflower-live-tray:10x20:weekly:usd`

3. **Creates 5 Bundle Products:**
   - Core 4-Pack
   - Brassica Builder Trio
   - Superfood Duo
   - Chef's Premium 4×5×5
   - Color Pop 4×5×5

### **Output Example:**
```
✓ Black Oil Sunflower — Live Tray (10×20) → $30.00 one-time | $28.00/week | $110.00/month
✓ Dun Pea Shoots — Live Tray (10×20) → $30.00 one-time | $28.00/week | $110.00/month
✓ Red Garnet Amaranth (5×5) → $14.00 one-time | $13.00/week
✓ Basil Dark Opal — 5×5 (5×5) → $13.00 one-time | $12.00/week
✓ Bundle created: Core 4-Pack (10×20)

All done! 🎉
```

---

## 💳 Pricing Strategy

### **Core Line (10×20)** - Volume Business
- **One-time:** $30/tray
- **Weekly:** $28/tray (7% discount)
- **Monthly:** $110/month (~$27.50/week, 8% discount)

**Target Customers:**
- Restaurants needing consistent supply
- Meal prep businesses
- Health-conscious families
- Catering companies

### **Premium Line (5×5)** - High Margin
- **One-time:** $13-15/tray
- **Weekly:** $11-14/tray (8-10% discount)

**Target Customers:**
- Home chefs wanting variety
- Single-person households
- Specialty cuisine (sushi, Thai, fine dining)
- Gift purchases

### **Bundles** - Upsell Strategy
- **4-Pack:** $115 (save $5, 4% discount)
- **Trio:** $87 (save $3, 3% discount)
- **Premium 4×5×5:** $50 (save $2, 4% discount)

**Why Bundles Work:**
- Higher average order value (AOV)
- Encourages trying new varieties
- Easier decision-making (curated selections)
- Better for subscriptions (set it and forget it)

---

## 🔑 Lookup Key System

**Format:** `{product-id}:{size}:{term}:usd`

**Examples:**
```
sunflower-live-tray:10x20:one_time:usd
peas-live-tray:10x20:weekly:usd
amaranth-red-5x5:5x5:weekly:usd
basil-thai-5x5:5x5:one_time:usd
bundle-core-4pack:bundle:monthly:usd
```

**Why Lookup Keys:**
- Stable references (don't change if price ID changes)
- Easy to reference in code
- Can update prices without breaking checkout
- Perfect for subscription management

---

## 🔄 Updating Prices

### **To Change Pricing:**

1. **Edit `PRICING` object in script:**
```javascript
const PRICING = {
  "10x20": {
    one_time_cents: 3200,  // Changed from 3000
    weekly_cents: 3000,    // Changed from 2800
    monthly_cents: 11800,  // Changed from 11000
  }
};
```

2. **Re-run script:**
```bash
node scripts/seed-stripe-products.js
```

3. **Script is idempotent:**
   - Finds existing products by `metadata.slug`
   - Only creates NEW prices (lookup_key prevents duplicates)
   - Safe to run multiple times

---

## 📊 Stripe Dashboard

After running the script, visit: https://dashboard.stripe.com/products

You'll see:
- All 11+ products listed
- Multiple prices per product (one-time, weekly, monthly)
- Bundles as separate products
- Metadata tags for filtering

---

## 🛒 How Checkout Uses These Products

### **In Your Code:**

```typescript
// Customer selects "Pea Shoots - Weekly Subscription"
const priceId = await stripe.prices.retrieve({
  lookup_key: 'peas-live-tray:10x20:weekly:usd'
});

// Create checkout session:
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: priceId.id,
    quantity: 2
  }],
  mode: 'subscription',  // or 'payment' for one-time
  success_url: 'https://chefpax.com/thanks',
  cancel_url: 'https://chefpax.com/shop'
});
```

---

## 🎯 Subscription Management

**Customer Portal:**
- Stripe Customer Portal (built-in)
- Customers can pause, cancel, update payment
- Accessible via: `/api/create-portal-session`

**Admin Management:**
- View all subscriptions in Stripe Dashboard
- Manually adjust subscriptions if needed
- Set up dunning (retry failed payments)
- Configure cancellation flow

---

## 💡 Pro Tips

1. **Test Mode First:**
   - Use `sk_test_...` key initially
   - Create test products/prices
   - Test checkout flow end-to-end
   - Then run with `sk_live_...` for production

2. **Price Archiving:**
   - Never delete prices (breaks existing subscriptions!)
   - Archive old prices when updating
   - Keep lookup_keys stable

3. **Product Images:**
   - Add image URLs to products after running script
   - Upload to Stripe dashboard or via API
   - Shows in checkout and receipts

4. **Metadata Usage:**
   - Use metadata for filtering in dashboard
   - Track grow parameters if needed
   - Link to MongoDB product IDs

---

## 🔧 Troubleshooting

### **"Product already exists" error:**
✅ This is normal! Script finds existing and reuses it.

### **"Invalid API key" error:**
❌ Check `STRIPE_SECRET_KEY` environment variable
```bash
echo $STRIPE_SECRET_KEY  # Should start with sk_live_ or sk_test_
```

### **"File not found" error:**
❌ Make sure `chefpax_grow_cards_dashboard_full (1).json` exists in project root

### **Prices not showing in dashboard:**
✅ Prices are created but might not be default. Check product → Pricing tab.

---

## 📝 Next Steps

After running this script:
1. ✅ Products and prices created in Stripe
2. ⏳ Add product images in Stripe dashboard
3. ⏳ Test checkout with test card (4242 4242 4242 4242)
4. ⏳ Set up Stripe webhook in production (already done!)
5. ✅ Ready to accept payments!

---

Last updated: October 11, 2025

