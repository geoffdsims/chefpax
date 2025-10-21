const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// ⚠️ REPLACE THESE WITH YOUR VALUES
// See APPLE_SIGNIN_SETUP.md for where to find these
const TEAM_ID = 'YOUR_TEAM_ID';        // From Apple Developer Account page (e.g., 'XYZ9876ABC')
const KEY_ID = 'YOUR_KEY_ID';          // From the Key you created (e.g., 'ABC123DEFG')
const CLIENT_ID = 'com.chefpax.webapp.signin';  // Your Services ID
const PRIVATE_KEY_PATH = path.join(process.env.HOME, 'chefpax-apple-keys/AuthKey_YOUR_KEY_ID.p8');

console.log('🍎 Generating Apple Sign In Client Secret...\n');

// Validate configuration
if (TEAM_ID === 'YOUR_TEAM_ID' || KEY_ID === 'YOUR_KEY_ID') {
  console.error('❌ Error: You need to replace the placeholder values!\n');
  console.log('📋 Steps:');
  console.log('1. Open this file: scripts/generate-apple-secret.js');
  console.log('2. Replace TEAM_ID with your Apple Team ID');
  console.log('3. Replace KEY_ID with your Apple Key ID');
  console.log('4. Update PRIVATE_KEY_PATH with your actual .p8 filename\n');
  console.log('See APPLE_SIGNIN_SETUP.md for detailed instructions.');
  process.exit(1);
}

// Generate JWT (valid for 6 months - maximum allowed by Apple)
try {
  // Check if private key file exists
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error(`❌ Error: Private key file not found at: ${PRIVATE_KEY_PATH}\n`);
    console.log('💡 Make sure:');
    console.log('1. You downloaded the .p8 file from Apple Developer portal');
    console.log('2. You moved it to: ~/chefpax-apple-keys/');
    console.log('3. You updated PRIVATE_KEY_PATH with the correct filename\n');
    process.exit(1);
  }

  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 15777000; // 6 months in seconds (max allowed)
  
  const clientSecret = jwt.sign(
    {
      iss: TEAM_ID,
      iat: now,
      exp: expiry,
      aud: 'https://appleid.apple.com',
      sub: CLIENT_ID,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: KEY_ID,
    }
  );

  const expiryDate = new Date(expiry * 1000);
  
  console.log('✅ Apple Client Secret Generated Successfully!\n');
  console.log('═'.repeat(80));
  console.log('\n📋 Copy this secret and add it to your environment:\n');
  console.log('APPLE_SECRET=' + clientSecret);
  console.log('\n' + '═'.repeat(80));
  console.log('\n⏰ Important Information:');
  console.log(`   • This secret is valid for 6 months`);
  console.log(`   • Expires: ${expiryDate.toLocaleDateString()} at ${expiryDate.toLocaleTimeString()}`);
  console.log(`   • Set a reminder to regenerate before this date!\n`);
  console.log('📝 Next Steps:');
  console.log('   1. Add APPLE_SECRET to .env.local (for local development)');
  console.log('   2. Add APPLE_SECRET to Vercel environment variables');
  console.log('   3. Also add: APPLE_ID=com.chefpax.webapp.signin\n');
  console.log('🔄 To regenerate later, just run: node scripts/generate-apple-secret.js\n');
  
} catch (error) {
  console.error('❌ Error generating client secret:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check that TEAM_ID, KEY_ID, and CLIENT_ID are correct');
  console.log('2. Verify the PRIVATE_KEY_PATH points to your .p8 file');
  console.log('3. Ensure the .p8 file is readable (chmod 600)');
  console.log('4. Make sure you\'re using the correct Key ID that matches the .p8 file\n');
  console.log('📖 See APPLE_SIGNIN_SETUP.md for detailed setup instructions.');
  process.exit(1);
}

