import { NextResponse } from 'next/server';
import { createFacebookAPI } from '@/lib/facebook-marketing-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const facebookAPI = createFacebookAPI();
    
    if (!facebookAPI) {
      return NextResponse.json({
        success: false,
        error: 'Facebook API not configured',
        message: 'Missing required environment variables'
      }, { status: 500 });
    }

    // Test posting capability with a simple test message
    const testMessage = `🧪 Facebook App Review Test Post - ${new Date().toLocaleString()}

This is an automated test post demonstrating ChefPax's pages_manage_posts permission for Facebook App Review.

ChefPax uses this permission to:
✅ Announce fresh harvest availability
✅ Post product photos and updates
✅ Engage with local Austin customers

#ChefPax #Microgreens #AustinLocal #FreshProduce`;

    const result = await facebookAPI.createPost({
      message: testMessage
    });

    return NextResponse.json({
      success: true,
      message: '✅ pages_manage_posts permission working',
      postId: result.id,
      postUrl: `https://facebook.com/${result.id}`,
      testMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Facebook Post Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test post',
      details: error.response?.data || error,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

