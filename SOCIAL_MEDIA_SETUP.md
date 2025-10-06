# Social Media Integration Setup

## Required Environment Variables

Add these to your `.env.local` file:

### Facebook Integration
```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"
FACEBOOK_ACCESS_TOKEN="your_facebook_page_access_token"
FACEBOOK_PAGE_ID="your_facebook_page_id"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="your_facebook_pixel_id"
```

### Instagram Integration
```bash
# Instagram Basic Display API
INSTAGRAM_ACCESS_TOKEN="your_instagram_access_token"
INSTAGRAM_APP_SECRET="your_instagram_app_secret"
INSTAGRAM_USER_ID="your_instagram_user_id"
```

### Combined Social Media Automation
```bash
# Social Media Automation (uses both Facebook and Instagram)
SOCIAL_MEDIA_AUTOMATION_ENABLED="true"
SOCIAL_MEDIA_POST_INTERVAL_HOURS="24"
SOCIAL_MEDIA_AUTO_POST_HARVEST="true"
SOCIAL_MEDIA_AUTO_POST_DELIVERY="true"
```

## How to Get Instagram Credentials

### Step 1: Create Instagram Business Account
1. Go to [Instagram Business](https://business.instagram.com/)
2. Convert your personal account to Business or create a new Business account
3. Connect it to your Facebook Page

### Step 2: Get Instagram Access Token
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app (same one used for Facebook)
3. Go to **Instagram Basic Display** product
4. Click **Create App** or use existing app
5. Add **Instagram Basic Display** product
6. Go to **Instagram Basic Display > Basic Display**
7. Click **Generate Token**
8. Copy the **User Access Token**

### Step 3: Exchange for Long-lived Token
Use the Instagram API to exchange your short-lived token:
```bash
curl -X GET "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=YOUR_APP_SECRET&access_token=YOUR_SHORT_LIVED_TOKEN"
```

## Instagram Permissions Needed

Your Instagram Business Account needs these permissions:
- `instagram_basic` - Basic profile and media access
- `pages_read_engagement` - Read page engagement data
- `pages_show_list` - Show connected pages

## Testing the Integration

### Test Instagram Connection
```bash
curl https://your-domain.com/api/test/instagram
```

### Test Combined Posting
```bash
curl -X POST https://your-domain.com/api/test/instagram \
  -H "Content-Type: application/json" \
  -d '{"message": "Test post from ChefPax! 🌱", "imageUrl": "https://example.com/image.jpg"}'
```

## Automation Features

The system will automatically:

1. **Post to Both Platforms** - When you post content, it goes to both Facebook and Instagram
2. **Harvest Updates** - Automatically post when microgreens are harvested
3. **Delivery Updates** - Post delivery confirmations and photos
4. **Educational Content** - Share growing tips and microgreen benefits
5. **Promotional Content** - Share discounts and special offers

## Content Templates

### Harvest Update
```
🌱 Fresh {productName} harvested today! {quantity} trays ready for delivery. Order yours at chefpax.com! #microgreens #fresh #local #healthy
```

### Delivery Update
```
🚚 {deliveryCount} fresh microgreen trays delivered today! Our local courier system ensures your microgreens arrive fresh and ready to grow. #delivery #fresh #microgreens
```

### Educational Content
```
📚 {title}

{content}

💡 Pro Tips:
• {tip1}
• {tip2}

#microgreens #education #growing #healthy
```

## Troubleshooting

### Common Issues

1. **"Instagram API error: Invalid access token"**
   - Your token may have expired
   - Exchange for a new long-lived token

2. **"Instagram API error: (#100) Only owners of the URL have the ability to specify the picture"**
   - Use publicly accessible image URLs
   - Images must be HTTPS

3. **"Instagram API error: (#200) If posting to a group, requires app being installed in the group"**
   - Make sure your Instagram account is connected to your Facebook Page
   - Verify you have the correct permissions

### Token Refresh

Instagram tokens expire every 60 days. Set up automatic refresh:
```javascript
// Add to your automation system
const refreshInstagramToken = async () => {
  const response = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${INSTAGRAM_ACCESS_TOKEN}`);
  const data = await response.json();
  // Update your environment variable with data.access_token
};
```

## Next Steps

1. Add the environment variables to your `.env.local`
2. Test the Instagram connection
3. Set up automatic token refresh
4. Configure automation triggers for harvest/delivery posts
5. Monitor engagement and adjust posting frequency
