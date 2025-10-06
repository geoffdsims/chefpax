# Roadie API Setup Guide

## How to Get Your Roadie API Token

### Step 1: Access Your Roadie Business Dashboard
1. Go to [https://business.roadie.com/](https://business.roadie.com/)
2. Log in with your ChefPax LLC account credentials

### Step 2: Navigate to API Token Generation
1. In the left sidebar, click on **"Administration"**
2. Select **"Account"** from the dropdown
3. Look for **"API Token"** or **"Generate Token"** section

### Step 3: Generate Your API Token
1. Click **"Generate Token"** button
2. Provide a description: `"ChefPax Delivery Integration"`
3. Copy the generated API token (it will look like: `roadie_xxxxx...`)

### Step 4: Add to Environment Variables
Add this to your `.env.local` file:
```bash
ROADIE_CUSTOMER_ID="faa62a1d-2708-4eb4-86ea-f9d81c9cb955"
ROADIE_API_TOKEN="roadie_your_actual_token_here"
```

### Step 5: Test Your API Token
Test that your token works:
```bash
curl -X GET \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer YOUR_ROADIE_API_TOKEN" \
  https://api.roadie.so/api/catalog/entities
```

## If You Can't Find the API Token Section

### Alternative Method 1: Check User Permissions
1. Make sure your account has **"Roadie API Key Access"** policy
2. Contact Roadie support if you don't see this option

### Alternative Method 2: Contact Roadie Support
1. Email: support@roadie.com
2. Subject: "API Token Access Request for ChefPax LLC"
3. Include your Customer ID: `faa62a1d-2708-4eb4-86ea-f9d81c9cb955`

### Alternative Method 3: Use Roadie Web Interface
If API access isn't available yet, you can still:
1. Create deliveries manually through the Roadie dashboard
2. Use the "Create A Delivery" feature you saw
3. Set up templates for consistent delivery details

## Testing Your Integration

Once you have the API token:

### Test Basic Connection
```bash
curl https://chefpax.com/api/test/roadie
```

### Test Delivery Creation
```bash
curl -X POST https://chefpax.com/api/test/roadie \
  -H "Content-Type: application/json" \
  -d '{
    "pickupAddress": {
      "street": "123 Your Street",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    },
    "dropoffAddress": {
      "street": "456 Customer Ave",
      "city": "Austin", 
      "state": "TX",
      "zip": "78702"
    }
  }'
```

## Roadie Features Available

Based on your dashboard, you have access to:
- ✅ **Create A Delivery** - Individual deliveries
- ✅ **Templates** - Save consistent delivery details
- ✅ **Bulk Upload** - Mass delivery creation
- ✅ **Batch Delivery** - Combine multiple deliveries
- ✅ **Address Book** - Saved pickup/dropoff locations

## Next Steps

1. **Get your API token** using the steps above
2. **Add it to your environment variables**
3. **Test the integration** with the provided endpoints
4. **Set up delivery templates** for your microgreen trays
5. **Configure your pickup address** in the system

## Support

If you need help:
- **Roadie Support**: support@roadie.com
- **Documentation**: https://roadie.io/docs/
- **API Reference**: https://roadie.io/docs/api/
