/**
 * Script to refresh Facebook Page Access Token
 * Run this every 50 days to keep token fresh
 */

async function refreshFacebookToken() {
  const currentToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!currentToken || !appId || !appSecret) {
    throw new Error('Missing Facebook credentials');
  }

  // Exchange current token for a new long-lived token
  const url = `https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.access_token) {
    console.log('✅ New Facebook token generated (valid for 60 days):');
    console.log(data.access_token);
    console.log('\nUpdate this in:');
    console.log('1. Vercel: Settings → Environment Variables → FACEBOOK_ACCESS_TOKEN');
    console.log('2. .env.local file');
    return data.access_token;
  } else {
    throw new Error('Failed to refresh token: ' + JSON.stringify(data));
  }
}

// Run if called directly
if (require.main === module) {
  refreshFacebookToken()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { refreshFacebookToken };







