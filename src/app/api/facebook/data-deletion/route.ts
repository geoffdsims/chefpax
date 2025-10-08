import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

/**
 * Facebook Data Deletion Callback
 * Handles requests from Facebook to delete user data
 * Required for Facebook App Review
 */

interface FacebookDataDeletionRequest {
  signed_request: string;
}

interface ParsedSignedRequest {
  user_id: string;
  algorithm: string;
  issued_at: number;
  expires: number;
}

/**
 * Parse Facebook signed request
 */
function parseSignedRequest(signedRequest: string, secret: string): ParsedSignedRequest | null {
  try {
    const [encodedSig, payload] = signedRequest.split('.', 2);
    
    // Decode the signature
    const signature = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('hex');
    
    // Decode the payload
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    
    // Verify signature (simplified - in production, use proper HMAC verification)
    const expectedSig = require('crypto')
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSig) {
      console.error('Invalid signature');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing signed request:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as FacebookDataDeletionRequest;
    const { signed_request } = body;
    
    if (!signed_request) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
    }
    
    // Parse the signed request
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appSecret) {
      return NextResponse.json({ error: 'App secret not configured' }, { status: 500 });
    }
    
    const parsedRequest = parseSignedRequest(signed_request, appSecret);
    if (!parsedRequest) {
      return NextResponse.json({ error: 'Invalid signed request' }, { status: 400 });
    }
    
    const { user_id } = parsedRequest;
    
    // Delete user data from your database
    const db = await getDb();
    
    // Delete user data from all relevant collections
    const deletionResults = await Promise.all([
      // Delete user profile
      db.collection('userProfiles').deleteMany({ userId: user_id }),
      
      // Delete orders (anonymize instead of delete for business records)
      db.collection('orders').updateMany(
        { userId: user_id },
        { 
          $set: { 
            userId: 'deleted_user',
            customerEmail: 'deleted@chefpax.com',
            customerName: 'Deleted User',
            deletedAt: new Date().toISOString()
          }
        }
      ),
      
      // Delete subscriptions
      db.collection('subscriptions').updateMany(
        { userId: user_id },
        { 
          $set: { 
            userId: 'deleted_user',
            status: 'cancelled',
            deletedAt: new Date().toISOString()
          }
        }
      ),
      
      // Delete FCM tokens
      db.collection('fcmTokens').deleteMany({ userId: user_id }),
      
      // Delete any other user-specific data
      db.collection('userSessions').deleteMany({ userId: user_id }),
      db.collection('userPreferences').deleteMany({ userId: user_id })
    ]);
    
    console.log(`Data deletion completed for user ${user_id}:`, deletionResults);
    
    // Return success response to Facebook
    return NextResponse.json({
      url: 'https://chefpax.com/data-deletion-complete',
      confirmation_code: `chefpax_${user_id}_${Date.now()}`
    });
    
  } catch (error) {
    console.error('Data deletion callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // Handle GET requests for data deletion instructions
  return NextResponse.json({
    message: 'ChefPax Data Deletion Instructions',
    instructions: [
      'To delete your data from ChefPax:',
      '1. Log into your account at https://chefpax.com/account',
      '2. Go to Account Settings',
      '3. Click "Delete Account"',
      '4. Confirm deletion',
      '',
      'Alternatively, email us at privacy@chefpax.com with your account email',
      'and we will delete your data within 30 days.',
      '',
      'For more information, see our Privacy Policy: https://chefpax.com/privacy-policy'
    ]
  });
}
