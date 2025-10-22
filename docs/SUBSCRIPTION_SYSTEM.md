# 🔄 ChefPax Subscription System Documentation

**Purpose:** Prevent subscription features from breaking and provide clear maintenance guidelines.

---

## 🎯 System Overview

ChefPax has **TWO** checkout flows:

### 1. **One-time Checkout** (`/api/checkout`)
- For single purchases
- No recurring billing
- Optional one-time discount for "subscribing" to get future discounts

### 2. **True Subscription Checkout** (`/api/checkout-subscription`)
- Creates actual Stripe subscriptions
- Weekly recurring billing
- 10% discount applied automatically
- Customer can manage in Stripe customer portal

---

## 🔧 How It Works

### Cart Page Logic
```typescript
// In src/app/cart/page.tsx
const endpoint = isSubscription ? "/api/checkout-subscription" : "/api/checkout";
```

**When user checks "Subscribe & Save 10%":**
1. User must be signed in (authentication required)
2. Cart calls `/api/checkout-subscription` instead of `/api/checkout`
3. Creates Stripe subscription with recurring billing
4. 10% discount applied to all items
5. Customer gets weekly deliveries automatically

---

## 🛡️ Safeguards System

### Health Monitoring
- **Endpoint:** `/api/subscription-health`
- **Purpose:** Monitor subscription system health
- **Checks:** Stripe config, database, endpoints

### Logging
- **All subscription events logged** via `logSubscriptionEvent()`
- **Failed attempts tracked** with error details
- **Success metrics recorded** for analytics

### Validation
- **Authentication required** for subscriptions
- **Product validation** before creating subscription
- **Stripe configuration checks** before processing

---

## 🚨 Common Issues & Fixes

### Issue: "Subscription checkbox not working"
**Check:**
1. User is signed in? (Required for subscriptions)
2. `/api/checkout-subscription` endpoint responding?
3. Stripe configuration valid?

**Fix:**
```bash
# Check subscription health
curl /api/subscription-health

# Test subscription endpoint
curl -X POST /api/checkout-subscription \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Issue: "No recurring billing"
**Check:**
1. Using correct endpoint (`/api/checkout-subscription` not `/api/checkout`)
2. Stripe subscription mode enabled
3. Recurring billing configured in Stripe

### Issue: "Discount not applied"
**Check:**
1. Subscription checkout applies 10% discount automatically
2. One-time checkout only applies discount if `isSubscription` flag set
3. Frontend calculation vs Stripe calculation mismatch

---

## 🔄 Maintenance Checklist

### Weekly
- [ ] Check `/api/subscription-health` status
- [ ] Review subscription logs for errors
- [ ] Verify Stripe webhook processing
- [ ] Test subscription creation flow

### Monthly
- [ ] Review subscription metrics
- [ ] Check customer portal functionality
- [ ] Validate recurring billing
- [ ] Update subscription documentation

### Before Major Changes
- [ ] Test subscription flow end-to-end
- [ ] Verify Stripe configuration
- [ ] Check database connectivity
- [ ] Validate authentication flow

---

## 📊 Monitoring

### Key Metrics
- **Subscription conversion rate**
- **Failed subscription attempts**
- **Stripe webhook processing**
- **Customer portal usage**

### Alerts
- **Subscription health degraded**
- **Stripe API errors**
- **Authentication failures**
- **Database connection issues**

---

## 🚀 Development Guidelines

### Adding New Features
1. **Never modify subscription logic** without testing
2. **Always test both checkout flows** (one-time vs subscription)
3. **Update safeguards** if adding new validation
4. **Document changes** in this file

### Testing Subscriptions
```bash
# Test subscription health
curl /api/subscription-health

# Test subscription creation (requires auth)
curl -X POST /api/checkout-subscription \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"cart": [...], "customer": {...}}'
```

### Debugging
1. **Check logs** for subscription events
2. **Verify Stripe dashboard** for subscription creation
3. **Test customer portal** access
4. **Validate webhook processing**

---

## 📝 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts              # One-time checkout
│   │   ├── checkout-subscription/route.ts # Subscription checkout
│   │   └── subscription-health/route.ts   # Health monitoring
│   └── cart/page.tsx                      # Cart with subscription logic
├── lib/
│   ├── subscription-safeguards.ts         # Safeguards system
│   └── stripe.ts                          # Stripe configuration
└── components/
    └── SubscriptionManager.tsx            # Customer subscription management
```

---

## ⚠️ Critical Rules

### DO NOT:
- ❌ Remove subscription endpoints without migration plan
- ❌ Change subscription logic without testing
- ❌ Modify Stripe configuration without validation
- ❌ Break authentication requirements for subscriptions

### ALWAYS:
- ✅ Test subscription flow before deploying
- ✅ Check subscription health after changes
- ✅ Log subscription events for debugging
- ✅ Validate Stripe configuration

---

## 🆘 Emergency Procedures

### If Subscriptions Stop Working:
1. **Check health endpoint:** `/api/subscription-health`
2. **Review logs** for error patterns
3. **Verify Stripe dashboard** for API issues
4. **Test authentication** flow
5. **Validate database** connectivity

### If Customers Can't Subscribe:
1. **Verify sign-in required** for subscriptions
2. **Check subscription checkbox** functionality
3. **Test subscription endpoint** directly
4. **Validate Stripe configuration**

### If Recurring Billing Fails:
1. **Check Stripe subscription status**
2. **Verify webhook processing**
3. **Review customer payment methods**
4. **Test subscription renewal flow**

---

**Last Updated:** October 22, 2025  
**Maintained By:** Development Team  
**Next Review:** November 22, 2025
