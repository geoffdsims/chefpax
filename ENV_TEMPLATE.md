# Environment Variables Template

Copy these variables to your `.env.local` file:

```bash
# Facebook Integration
NEXT_PUBLIC_FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"
FACEBOOK_ACCESS_TOKEN="your_facebook_page_access_token"
FACEBOOK_PAGE_ID="your_facebook_page_id"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="your_facebook_pixel_id"

# Instagram Integration
INSTAGRAM_ACCESS_TOKEN="your_instagram_access_token"
INSTAGRAM_APP_SECRET="your_instagram_app_secret"
INSTAGRAM_USER_ID="your_instagram_user_id"

# Social Media Automation
SOCIAL_MEDIA_AUTOMATION_ENABLED="true"
SOCIAL_MEDIA_POST_INTERVAL_HOURS="24"
SOCIAL_MEDIA_AUTO_POST_HARVEST="true"
SOCIAL_MEDIA_AUTO_POST_DELIVERY="true"

# Existing variables (keep these)
STRIPE_SECRET_KEY="your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
MONGODB_URI="your_mongodb_uri"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="https://chefpax.com"

# Delivery Settings
CHEFPAX_DELIVERY_FEE_CENTS="500"
CHEFPAX_DELIVERY_DOW="5"

# Redis (for job queues)
REDIS_URL="your_redis_url"

# Uber Direct API (Same-day delivery)
UBER_DIRECT_CLIENT_ID="mR-YmI6u9x7FvfgpFMYub4xHBBOdNgwk"
UBER_DIRECT_CLIENT_SECRET="rdpzmrT0lSqBDKh2ZOntEzrAeK0ZN-jJovCJMnUv"
UBER_DIRECT_CUSTOMER_ID="2b446f20-b70e-4e79-8b7f-c0b819829454"

# Roadie API (Crowdsourced same-day delivery)
ROADIE_CUSTOMER_ID="faa62a1d-2708-4eb4-86ea-f9d81c9cb955"
ROADIE_API_TOKEN="your_roadie_api_token"
```

## Instagram Setup Steps

1. **Convert to Instagram Business Account**
   - Go to Instagram Settings > Account > Switch to Professional Account
   - Choose "Business" account type
   - Connect to your Facebook Page

2. **Get Instagram Access Token**
   - Go to Facebook Developers > Your App
   - Add "Instagram Basic Display" product
   - Generate User Access Token
   - Exchange for long-lived token (60 days)

3. **Test the Integration**
   ```bash
   curl https://chefpax.com/api/test/instagram
   ```

4. **Post to Both Platforms**
   ```bash
   curl -X POST https://chefpax.com/api/test/instagram \
     -H "Content-Type: application/json" \
     -d '{"message": "Fresh microgreens harvested! 🌱", "imageUrl": "https://example.com/harvest.jpg"}'
   ```

## Uber Direct Setup Steps

1. **Test Uber Direct Connection**
   ```bash
   curl https://chefpax.com/api/test/uber-direct
   ```

2. **Test Delivery Estimation**
   ```bash
   curl -X POST https://chefpax.com/api/test/uber-direct \
     -H "Content-Type: application/json" \
     -d '{"pickupAddress": {"street": "123 Your St", "city": "Austin", "state": "TX", "zip": "78701"}, "dropoffAddress": {"street": "456 Customer Ave", "city": "Austin", "state": "TX", "zip": "78702"}}'
   ```

## Roadie Setup Steps

1. **Get Roadie API Token**
   - Go to your [Roadie Business Dashboard](https://business.roadie.com/)
   - Navigate to **Administration** > **Account**
   - Provide a description (e.g., "ChefPax Delivery Integration")
   - Click **Generate Token**
   - Copy the API token

2. **Test Roadie Connection**
   ```bash
   curl https://chefpax.com/api/test/roadie
   ```

3. **Test Roadie Delivery Estimation**
   ```bash
   curl -X POST https://chefpax.com/api/test/roadie \
     -H "Content-Type: application/json" \
     -d '{"pickupAddress": {"street": "123 Your St", "city": "Austin", "state": "TX", "zip": "78701"}, "dropoffAddress": {"street": "456 Customer Ave", "city": "Austin", "state": "TX", "zip": "78702"}}'
   ```

4. **Test API Token Directly**
   ```bash
   curl -X GET \
     -H 'Accept: application/json' \
     -H "Authorization: Bearer YOUR_ROADIE_API_TOKEN" \
     https://api.roadie.so/api/catalog/entities
   ```

## Delivery Pricing

**Uber Direct Same-Day Delivery:**
- Base cost: ~$8.50
- Distance: ~$0.50/mile
- Live tray surcharge: $2.00
- **Total estimated cost: $12.50**

**Roadie Same-Day Delivery:**
- Base cost: ~$7.00
- Distance: ~$0.40/mile
- Live tray surcharge: $1.50
- **Total estimated cost: $10.50**

**Delivery Provider Comparison:**
- **Uber Direct**: Higher cost, professional drivers, faster delivery (45 min)
- **Roadie**: Lower cost, crowdsourced drivers, slightly slower (60 min)
- **Local Courier**: Lowest cost, scheduled delivery, most reliable timing

**Your current delivery fee: $5.00**
**Recommended delivery fee: $15.00** (to cover delivery costs + margin)
