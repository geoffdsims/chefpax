# 🔁 ChefPax Automation Pillars - Complete Reference

**Last Updated:** October 11, 2025  
**Purpose:** Document all 5 automation streams for hands-off operations

---

## Overview

ChefPax runs on 5 core automation pillars that create a fully automated farm-to-customer pipeline:

1. **Orders & Subscriptions** - Hands-off checkout and recurring revenue
2. **Production & Grow Scheduling** - Seed → Harvest → Pack automation
3. **Delivery Automation** - Local delivery and shipping integration
4. **Marketing & Retention** - Set-and-forget customer engagement
5. **Analytics & Back-Office** - Business intelligence and ops dashboards

---

## 🛒 Pillar 1: Orders & Subscriptions (Hands-off Checkout)

### **Current Implementation: ✅ COMPLETE**

#### **Stripe Integration**
- **Status:** LIVE with production keys
- **Checkout:** Stripe hosted checkout session
- **Products:** 13 product SKUs synced with Stripe
- **Webhook:** `/api/stripe/webhook` handles all payment events

#### **Order Flow**
```
Customer places order
    ↓
Stripe processes payment
    ↓
Webhook fires: payment_intent.succeeded
    ↓
Order created in MongoDB
    ↓
Production tasks auto-generated (SEED → GERMINATE → LIGHT → HARVEST → PACK)
    ↓
Email + SMS confirmations sent
    ↓
Delivery scheduled (Uber Direct when configured)
```

**Files:**
- `src/app/api/checkout/route.ts` - Creates Stripe session
- `src/app/api/stripe/webhook/route.ts` - Handles payment events
- `src/lib/stripe.ts` - Stripe client configuration

#### **Subscription System**
- **Status:** Code complete, needs testing
- **Features:**
  - Weekly, bi-weekly, monthly frequencies
  - 10-15% subscription discounts
  - Auto-renewal with Stripe subscriptions
  - Pause/resume/cancel in customer portal

**Files:**
- `src/app/api/subscriptions/route.ts` - Subscription CRUD
- `src/app/api/checkout-subscription/route.ts` - Subscription checkout
- `src/components/SubscriptionManager.tsx` - Customer UI

#### **Product-to-Task Mapping**
Each product has `stages` array defining the production pipeline:
```typescript
stages: [
  { type: "SEED", offsetDays: 0, notes: "Sow 8.5 oz pea seeds" },
  { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout" },
  { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Tier 2, 25min flood" },
  { type: "HARVEST", offsetDays: 10, notes: "Day 8-10: Tendrils unfurl" },
  { type: "PACK", offsetDays: 10, notes: "Trim roots, package live tray" }
]
```

### **Future Enhancements**

#### **BullMQ Job Queue (Planned)**
```typescript
// When order placed:
await productionQueue.add('create-tasks', {
  orderId,
  productId,
  quantity,
  deliveryDate
}, {
  delay: calculateSeedingTime(product.leadTimeDays)
});

// BullMQ worker processes job:
- Creates SEED task at correct time
- Schedules subsequent tasks
- Sends notifications
```

**Benefits:**
- Delayed job execution (schedule tasks for future dates)
- Retry logic for failed tasks
- Distributed processing
- Job prioritization

**Requirements:**
- Redis instance (free tier on Upstash or Railway)
- BullMQ already in `package.json`

---

## 🌱 Pillar 2: Production & Grow Scheduling

### **Current Implementation: ✅ COMPLETE**

#### **Production Task System**
- **Status:** Fully functional
- **Dashboard:** `/admin/production`
- **Database:** MongoDB `productionTasks` collection

**Task Lifecycle:**
```
PENDING → READY → IN_PROGRESS → DONE
                            ↓
                         FAILED (requires intervention)
```

**Task Types:**
- **SEED:** Sowing seeds on scheduled date
- **GERMINATE:** Blackout period monitoring (0-3 days)
- **LIGHT:** Light phase monitoring (3-17 days)
- **HARVEST:** Harvesting ready crops
- **PACK:** Packaging for delivery

#### **Automated Task Creation**
When order placed:
1. System calculates delivery date from `product.leadTimeDays`
2. Backtracks to determine sow date
3. Creates all 5 task types with proper `runAt` timestamps
4. Assigns priority based on delivery urgency

**Files:**
- `src/app/admin/production/page.tsx` - Task dashboard
- `src/app/api/admin/production-tasks/route.ts` - Task CRUD
- `src/lib/inventory.ts` - Product definitions with stages

#### **Grow Cards Integration**
- **13 verified grow cards** with exact parameters
- Seeding densities (oz or grams)
- Blackout requirements (0-3 days)
- Light hours (12-16/day)
- Tier assignments (1-5 based on water needs)
- Harvest windows (7-18 days)

**Access:**
- Printable: `/admin/grow-cards`
- JSON data: `src/data/grow-cards.json`
- MD files: `docs/product-lineup/*.md` (local only)

### **Future Enhancements**

#### **Slack Notifications (Planned)**
```typescript
// When task becomes READY:
await slack.postMessage({
  channel: '#production',
  text: '🌱 Time to seed 2 trays of Red Amaranth (Order #12345)',
  attachments: [{
    fields: [
      { title: 'Product', value: 'Red Amaranth 10×20' },
      { title: 'Quantity', value: '2 trays' },
      { title: 'Tier', value: 'Tier 5' },
      { title: 'Instructions', value: 'Surface sow 4.5g, NO COVER, light from Day 0' }
    ]
  }]
});
```

#### **Label Printing (Planned)**
```typescript
// Auto-print tray labels via PrintNode:
await printNode.printLabel({
  printer: 'Brother-QL-800',
  template: 'tray-label',
  data: {
    product: 'Red Amaranth',
    sowDate: '2025-10-14',
    harvestDate: '2025-10-26',
    tier: 5,
    orderId: '#12345'
  }
});
```

#### **Inventory Auto-Reorder (Planned)**
```typescript
// When inventory low:
if (seeds.amaranth < reorderPoint) {
  await emailService.send({
    to: 'supplier@trueleafmarket.com',
    subject: 'Reorder Request: Amaranth Seeds',
    body: generatePurchaseOrder({
      product: 'Red Garnet Amaranth',
      quantity: '1 lb',
      urgency: 'high'
    })
  });
}
```

#### **n8n Workflow Automation (Planned)**
Self-hosted workflow automation:
- Task READY → Slack notification + Notion checklist
- Harvest complete → Update inventory + Social media post
- Low stock → Email supplier + Create PO draft
- Order shipped → Update customer + Request review (7 days later)

**Setup:**
- Self-host n8n on Railway/Fly.io (~$5/month)
- Connect to MongoDB, Slack, Email, etc.
- Visual workflow builder (no-code automation)

---

## 🚚 Pillar 3: Delivery Automation

### **Current Implementation: ✅ COMPLETE**

#### **Uber Direct Integration**
- **Status:** Code complete, ready for account activation
- **API:** `src/lib/uber-direct-api.ts`
- **Endpoint:** `/api/delivery/schedule`

**Features:**
- Automated delivery scheduling on order completion
- Real-time tracking URLs
- ETA calculations
- Delivery status webhooks

**Demo Mode:**
- Works without Uber account (logs delivery requests)
- Returns mock tracking URLs
- Ready to activate when you create Uber Direct account

**Flow:**
```
Order packed (PACK task → DONE)
    ↓
System calls Uber Direct API
    ↓
Driver assigned with ETA
    ↓
Customer gets "Out for delivery" SMS
    ↓
Delivery completed
    ↓
Customer gets "Delivered" SMS
```

**Files:**
- `src/lib/uber-direct-api.ts` - Uber Direct client
- `src/app/api/delivery/schedule/route.ts` - Delivery scheduling

### **Future Enhancements**

#### **Multi-Carrier Support (Planned)**
```typescript
// Route selection based on distance/cost:
const carriers = [
  { name: 'Uber Direct', maxDistance: 25, cost: calculateUberCost() },
  { name: 'Roadie', maxDistance: 50, cost: calculateRoadieCost() },
  { name: 'USPS', maxDistance: Infinity, cost: shippoQuote.rate }
];

const bestCarrier = selectOptimalCarrier(carriers, deliveryAddress);
```

#### **Shippo Integration (Planned)**
For regional/national shipping:
```typescript
await shippo.createShipment({
  addressFrom: chefpaxWarehouse,
  addressTo: customer.address,
  parcel: { length: 10, width: 20, height: 3, weight: 2 },
  servicelevel: 'usps_priority'
});
// Auto-purchase label, email tracking to customer
```

#### **Delivery Zones (Planned)**
- Austin Metro: Uber Direct (same-day)
- Texas: Roadie (next-day)
- National: USPS Priority (2-3 day with ice packs)

---

## 📧 Pillar 4: Marketing & Retention

### **Current Implementation: ✅ COMPLETE**

#### **Email Automation (SendGrid)**
- **Status:** LIVE and sending
- **Service:** `src/lib/email-service.ts`

**Automated Emails:**
1. **Order Confirmation** - Sent immediately on payment
2. **Welcome Email** - New customer signup
3. **Abandoned Cart #1** - 24 hours after abandonment
4. **Abandoned Cart #2** - 48 hours after abandonment (if still abandoned)
5. **Delivery Reminder** - 1 day before delivery
6. **Delivery Confirmation** - When delivered

**Templates:**
- Beautiful HTML with ChefPax branding
- Plain text fallback
- Mobile-responsive
- Personalized with customer name, order details

**Test:** `/test-email`

#### **SMS Notifications (Twilio)**
- **Status:** Configured, waiting toll-free verification (1-3 days)
- **Service:** `src/lib/sms-service.ts`

**Automated SMS:**
1. **Order Confirmation** - Immediate
2. **Delivery Reminder** - 1 day before
3. **Out for Delivery** - When driver assigned (with ETA)
4. **Delivered** - Confirmation
5. **Harvest Notification** - Fresh harvest available (for regulars)

**Test:** `/test-sms`

#### **Social Media Automation**
- **Status:** Facebook LIVE, Instagram pending App Review
- **Service:** `src/lib/social-media-posting.ts`

**Automated Posts:**
1. **Harvest Announcements** - When fresh batch ready
2. **Weekly Schedule** - Sunday preview of week's harvests
3. **Special Promotions** - Sales and offers
4. **Multi-platform** - Facebook + Instagram simultaneously

**APIs:**
- `/api/social-media/post-harvest` - Harvest announcement
- `/api/social-media/post-weekly` - Weekly schedule

**Test:** `/test-social`

### **Future Enhancements**

#### **Klaviyo/Customer.io Email Flows (Planned)**
Advanced segmentation and event-triggered campaigns:

**Lifecycle Campaigns:**
```
New Customer Journey:
Day 0: Welcome email
Day 3: "How to care for your microgreens"
Day 7: "Ready for your next harvest?"
Day 14: Recipe ideas email
Day 30: Subscription offer (15% off)
```

**Behavioral Triggers:**
```
if (customer.orderedLiveTray && !customer.reordered_in_45_days) {
  send('refill-reminder', {
    subject: 'Time to refresh your microgreens!',
    discount: '10% off your next order'
  });
}
```

**Product-Specific Flows:**
```
Premium Basil Buyers:
- Recipe: "Thai Basil Mojito"
- Pairing suggestions
- Chef interview video
- Upsell to subscription
```

#### **Twilio Studio SMS Flows (Planned)**
Visual SMS automation builder:
- High open rates (98% vs 20% email)
- Time-based sends (avoid 9 PM texts!)
- Two-way conversations ("Reply SKIP to pause this week")

#### **Referral Program (Planned)**
```typescript
// Native implementation:
const referralCode = generateCode(customer.id); // "GEOFF10"

if (newCustomer.referredBy) {
  // Give referrer $10 credit
  await credits.add(referrer.id, 1000);
  
  // Give new customer 10% off
  await coupons.create({
    code: 'WELCOME10',
    customerId: newCustomer.id,
    discount: 10
  });
}
```

**Track:**
- Referrals in MongoDB `referrals` collection
- Credits in `customerCredits` collection
- Leaderboard for top referrers

#### **Content Management (Planned)**
```typescript
// Hygraph or Contentful for:
- Recipe blog posts
- Growing tips
- Chef interviews
- Product descriptions (A/B test different copy)
- Landing pages (seasonal campaigns)

// Pull via GraphQL:
const recipes = await hygraph.query(`
  query {
    recipes(where: { tags_contains: "basil" }) {
      title
      ingredients
      instructions
      featuredImage
    }
  }
`);
```

---

## 📊 Pillar 5: Analytics, Accounting & Back-Office

### **Current Implementation: ⏳ PARTIAL**

#### **Admin Dashboard**
- **Status:** Production task management working
- **Location:** `/admin/production`
- **Features:**
  - Task queue (SEED → HARVEST → PACK)
  - Priority sorting
  - Status tracking
  - Order assignment

#### **Inventory Monitoring**
- **Status:** Complete
- **Service:** `src/lib/inventory-alerts.ts`
- **Features:**
  - Low stock email/SMS alerts
  - Reorder point notifications
  - Inventory health scoring
  - Capacity planning

**API:** `/api/inventory/check`

### **Future Enhancements**

#### **Analytics Options Evaluated**

**Chosen: TensorFlow.js for ML Forecasting**
- ✅ No fees or registration required
- ✅ Runs in Node.js/browser
- ✅ Open source
- ✅ Can train on your own data
- ✅ Use cases: Demand forecasting, optimal harvest timing, price optimization

**TensorFlow.js Use Cases for ChefPax:**

1. **Demand Forecasting**
```typescript
// Predict weekly demand by product:
const model = await tf.loadLayersModel('/models/demand-forecast.json');
const prediction = model.predict([
  dayOfWeek,
  weekOfYear,
  temperature,
  recentOrders,
  seasonality
]);

// Suggests: "Sow 6 trays Pea Shoots for next week (predicted demand: 5.8 trays)"
```

2. **Optimal Harvest Timing**
```typescript
// Predict best harvest day based on:
// - Growth curve data from IoT sensors
// - Historical quality scores
// - Customer delivery preferences
const optimalDay = predictHarvestDay({
  variety: 'sunflower',
  sowDate: '2025-10-14',
  temperatureHistory: iotData.temp,
  lightHoursHistory: iotData.light
});
// Returns: "Day 9.5" (harvest Friday AM for best quality)
```

3. **Dynamic Pricing**
```typescript
// Adjust prices based on:
// - Current inventory
// - Demand patterns
// - Competition
// - Seasonality
const suggestedPrice = model.predict([
  currentStock,
  historicalDemand,
  daysTilExpiry,
  competitorPrices
]);
// Suggests: "Reduce Amaranth to $42 (from $45) to clear inventory"
```

**Implementation Status:** Not yet implemented (chosen for future ML features)

**Alternative: Metabase (Business Intelligence)**
Self-hosted SQL-based dashboards:

**Key Metrics:**
```sql
-- MRR (Monthly Recurring Revenue)
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount_cents) / 100 as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY month;

-- Churn Rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'canceled') / 
  COUNT(*) as churn_rate
FROM subscriptions
WHERE created_at > NOW() - INTERVAL '30 days';

-- Cohort Analysis
SELECT 
  signup_month,
  months_since_signup,
  retention_rate
FROM customer_cohorts;

-- Grow Cycle Utilization
SELECT 
  product_variety,
  COUNT(*) as trays_grown,
  AVG(days_to_harvest) as avg_cycle_days,
  (weekly_capacity - COUNT(*)) as unused_capacity
FROM production_tasks
WHERE type = 'HARVEST' AND status = 'DONE'
GROUP BY product_variety;
```

**Dashboards:**
1. **Revenue Dashboard**
   - MRR trend
   - Customer LTV
   - Subscription vs one-time revenue
   - Revenue by product

2. **Operations Dashboard**
   - On-time delivery rate
   - Production cycle times
   - Capacity utilization by tier
   - Task completion rates

3. **Customer Dashboard**
   - New vs returning customers
   - Cohort retention
   - Churn prediction
   - Top products by customer segment

#### **Supabase Studio Alternative**
If using PostgreSQL instead of MongoDB:
- Built-in analytics
- Real-time subscriptions
- Row-level security
- GraphQL API auto-generated

#### **Daily Ops Slack Bot (Planned)**
```typescript
// Every morning at 8 AM:
const summary = await generateDailySummary();

await slack.post('#ops', `
🌅 Good morning! Here's your ChefPax daily brief:

📦 Orders:
  • 12 new orders yesterday
  • 3 subscriptions renewed
  • $487 total revenue

🌱 Production:
  • Seeded 4 trays Pea Shoots (Tier 2)
  • Harvesting 6 trays Radish today
  • 8 trays in germination phase

🚚 Deliveries:
  • 15 deliveries scheduled for today
  • 2 out for delivery now
  • 12 delivered yesterday (100% on-time)

⚠️ Alerts:
  • Low stock: Amaranth seeds (2 oz remaining)
  • Task overdue: Harvest 1× Sunflower (Order #12340)

💰 Financials:
  • MRR: $2,340 (+5% from last week)
  • 47 active subscriptions
  • 0 failed payments
`);
```

#### **Accounting Integration (Planned)**
```typescript
// QuickBooks or Xero sync:
await accounting.createInvoice({
  customer: order.customer,
  items: order.cart,
  total: order.totalAmount,
  date: order.createdAt,
  dueDate: order.deliveryDate
});

// Auto-reconcile Stripe payouts:
await accounting.matchTransaction({
  bankTransaction: stripePayout,
  invoices: relatedOrders
});
```

---

## 🎯 Implementation Status Summary

| Pillar | Status | Completion |
|--------|--------|------------|
| **1. Orders & Subscriptions** | ✅ Complete | 100% |
| **2. Production Scheduling** | ✅ Complete | 100% |
| **3. Delivery Automation** | ✅ Code Ready | 90% (needs Uber account) |
| **4. Marketing & Retention** | ✅ Complete | 95% (Twilio pending verification) |
| **5. Analytics & Back-Office** | ⏳ Partial | 60% (inventory working, need BI dashboards) |

**Overall Automation:** 89% Complete

---

## 🔧 Technologies Used

### **Current Stack**
- **Backend:** Next.js 15 API routes
- **Database:** MongoDB Atlas
- **Payments:** Stripe (LIVE mode)
- **Email:** SendGrid
- **SMS:** Twilio
- **Social:** Facebook Graph API, Instagram API, Twitter API
- **Delivery:** Uber Direct API (ready)
- **Auth:** NextAuth.js
- **Queue:** BullMQ (installed, not yet implemented)
- **Hosting:** Vercel

### **Planned Additions**
- **Job Queue:** Redis + BullMQ (for delayed tasks)
- **Analytics:** Metabase (self-hosted BI)
- **Workflows:** n8n (self-hosted automation)
- **Notifications:** Slack API
- **Shipping:** Shippo (for regional/national)
- **CMS:** Hygraph or Contentful (for content)
- **Accounting:** QuickBooks API (for invoicing)

---

## 💰 Monthly Operating Costs

### **Current (Production Ready)**
- Vercel: $20/month (Pro plan for production)
- MongoDB Atlas: $0-9/month (free tier → shared M2)
- SendGrid: $0-15/month (free tier → 40k emails)
- Twilio: ~$1/month (toll-free number) + $0.0075/SMS
- Stripe: 2.9% + $0.30 per transaction
- **Total: ~$25-50/month**

### **With Future Enhancements**
- Redis (Upstash): $0-10/month
- n8n (Railway): $5/month
- Metabase (Railway): $5/month
- Shippo: Pay-per-label (~$5-8 each)
- **Total: ~$40-75/month**

**ROI:** Automation saves 10-15 hours/week = $150-300/week in labor = 5-10× return on automation costs

---

## 📋 Next Steps to 100% Automation

### **Immediate (This Week)**
1. ✅ All 13 products deployed
2. ⏳ Wait for Twilio toll-free verification
3. ⏳ Wait for Facebook App Review approval
4. ⏳ Set up Google OAuth for admin security
5. ⏳ Create Uber Direct business account

### **Phase 2 (Next Month)**
1. Set up Redis + implement BullMQ delayed jobs
2. Add Slack notifications for task alerts
3. Build Metabase dashboards for analytics
4. Implement automated reorder for seed inventory
5. Set up n8n for workflow automation

### **Phase 3 (Month 2-3)**
1. Add Klaviyo for advanced email marketing
2. Implement referral program
3. Add Shippo for regional shipping
4. Build customer portal with order history
5. Add QuickBooks integration for accounting

---

## 🎓 Key Learnings & Best Practices

### **What's Working Well**
1. **Code-based product catalog** - No database required for shop
2. **Stage-based production tasks** - Clear workflow from seed to delivery
3. **Multi-channel notifications** - Email + SMS + Social redundancy
4. **Graceful fallbacks** - Demo mode when APIs not configured
5. **Comprehensive documentation** - Everything in `docs/` folder

### **Critical Success Factors**
1. **Follow grow cards exactly** - Tier assignments are critical
2. **Monitor task queue daily** - Dashboard is your command center
3. **Keep environment variables backed up** - `.env.backup` saved your butt
4. **Test before deploying** - `npm run build` catches errors early
5. **Document everything** - We'll never redo work again

### **Gotchas to Avoid**
1. ❌ Don't overwater basils or amaranth (Tier 4-5 only!)
2. ❌ Don't put light-germinating varieties in blackout
3. ❌ Don't commit `.env.local` to git (GitHub blocks it anyway)
4. ❌ Don't skip task updates in dashboard (breaks inventory tracking)
5. ❌ Don't mix up tier assignments (wrong tier = crop failure)

---

## 📞 Support & Resources

### **APIs & Services**
- Stripe Dashboard: https://dashboard.stripe.com/
- SendGrid Console: https://app.sendgrid.com/
- Twilio Console: https://console.twilio.com/
- MongoDB Atlas: https://cloud.mongodb.com/
- Facebook Developers: https://developers.facebook.com/
- Vercel Dashboard: https://vercel.com/

### **Documentation**
- This file: `docs/AUTOMATION_PILLARS.md`
- Quick start: `docs/QUICK_START.md`
- System status: `docs/SYSTEM_STATUS.md`
- Production schedule: `docs/PRODUCTION_SCHEDULE.md`
- Grow cards: `docs/product-lineup/`

### **Test Pages**
- Email: `/test-email`
- SMS: `/test-sms`
- Social: `/test-social`
- Notifications: `/test-notifications`

---

**This is your automation blueprint. Everything is documented so we never lose progress again!** 🚀

---

Last updated: October 11, 2025

