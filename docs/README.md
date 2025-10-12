# ChefPax Documentation

Welcome to the ChefPax documentation hub. Everything you need to run your microgreens business.

---

## 📚 Documentation Index

### 🎯 Vision & Strategy
- **[Automation Vision](./AUTOMATION_VISION.md)** - ⭐ START HERE - Complete automation roadmap and business model
- **[Automation Pillars](./AUTOMATION_PILLARS.md)** - Technical implementation of 5 core automation streams

### 🔐 Security & Authentication
- **[Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)** - Secure admin login configuration
- **[Environment Variables Reference](./ENV_VARIABLES_REFERENCE.md)** - All API keys (⚠️ Keep private!)

### 🌱 Production & Operations
- **[Production Schedule](./PRODUCTION_SCHEDULE.md)** - Weekly sowing schedule and workflow
- **[Product Lineup](./product-lineup/)** - Grow cards for each variety

### 🤖 Automation & Integrations
- **[System Status](./SYSTEM_STATUS.md)** - Complete status of all 5 automation components
- **[Facebook App Review Status](./FACEBOOK_APP_REVIEW_STATUS.md)** - Social media integration progress

### 🔧 Hardware & IoT
- **[IoT Hardware Status](./IOT_HARDWARE_STATUS.md)** - Raspberry Pi sensor setup progress

---

## 🚀 Quick Start Guide

### For Daily Production
1. Check `/admin/production` dashboard
2. Review pending tasks (SEED, GERMINATE, LIGHT, HARVEST, PACK)
3. Mark tasks as complete as you work through them
4. System auto-updates inventory and notifies customers

### For Processing Orders
1. Orders automatically create production tasks
2. Email & SMS confirmations sent automatically
3. Track delivery dates in admin dashboard
4. Delivery automation handles scheduling (when Uber Direct configured)

### For Monitoring
1. Check email for low stock alerts
2. Review inventory health in dashboard
3. Monitor IoT sensors (when fully connected)
4. Respond to customer inquiries

---

## 📱 Admin Pages (Requires Login)

- `/admin/production` - Production task management
- `/admin/grow-cards` - Printable grow cards for each variety
- `/admin/subscription-settings` - Configure subscription tiers
- `/admin/facebook-demo` - Social media integration testing

---

## 🧪 Test Pages (Development)

- `/test-email` - Email automation testing
- `/test-sms` - SMS notifications testing
- `/test-social` - Social media posting testing
- `/test-notifications` - Push notifications testing

---

## 🔑 Environment Setup

### Local Development
1. Copy `.env.backup` to `.env.local` if you lose it
2. All credentials documented in `ENV_VARIABLES_REFERENCE.md`
3. Never commit `.env.local` to git (protected by `.gitignore`)

### Production (Vercel)
1. Add all environment variables from `ENV_VARIABLES_REFERENCE.md`
2. Include `ADMIN_EMAIL=geoff@chefpax.com`
3. Set up Google OAuth credentials (see GOOGLE_OAUTH_SETUP.md)

---

## 🆘 Troubleshooting

### If something stops working:
1. Check `.env.local` file exists
2. Verify credentials in `ENV_VARIABLES_REFERENCE.md`
3. Restart dev server: `npm run dev`
4. Check Vercel environment variables match local

### If you need to restore:
1. Backup exists at `.env.backup`
2. All credentials documented in `ENV_VARIABLES_REFERENCE.md`
3. Copy values back to `.env.local`

---

## 📞 Support Resources

### Internal Tools
- MongoDB Atlas: https://cloud.mongodb.com/
- Stripe Dashboard: https://dashboard.stripe.com/
- SendGrid Console: https://app.sendgrid.com/
- Twilio Console: https://console.twilio.com/
- Facebook Developers: https://developers.facebook.com/

### Quick Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Test all systems
npm run check

# Backup environment
cp .env.local .env.backup
```

---

## 🎯 Launch Checklist

- [✅] All 5 automation components complete
- [✅] Email automation working (SendGrid)
- [⏳] SMS automation configured (pending Twilio verification)
- [✅] Social media automation ready (Facebook working, Instagram pending)
- [✅] Delivery automation implemented (Uber Direct ready)
- [✅] Inventory alerts configured
- [✅] Admin dashboard secured
- [⏳] Google OAuth setup (recommended)
- [⏳] Product photos (placeholder images current)
- [⏳] IoT monitoring (waiting on cables)
- [⏳] Facebook App Review approval

**Launch Ready: 95%** 🚀

---

Last updated: October 11, 2025

