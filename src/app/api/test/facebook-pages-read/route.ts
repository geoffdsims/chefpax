import { NextResponse } from 'next/server';

/**
 * Test endpoint for Facebook pages_read_engagement permission
 * This endpoint demonstrates reading page information and engagement metrics
 */
export async function GET() {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
      return NextResponse.json(
        { error: 'Facebook credentials not configured' },
        { status: 500 }
      );
    }

    // Test 1: Read basic page info (requires pages_read_engagement)
    const pageInfoUrl = `https://graph.facebook.com/v23.0/${pageId}?fields=id,name,fan_count,about&access_token=${accessToken}`;
    const pageInfoResponse = await fetch(pageInfoUrl);
    const pageInfo = await pageInfoResponse.json();

    if (!pageInfoResponse.ok) {
      console.error('Facebook API error:', pageInfo);
      return NextResponse.json(
        { 
          error: 'Facebook API error',
          details: pageInfo.error?.message || 'Unknown error',
          pageInfo 
        },
        { status: 400 }
      );
    }

    // Test 2: Read page feed (posts) - requires pages_read_engagement
    const feedUrl = `https://graph.facebook.com/v23.0/${pageId}/feed?fields=id,message,created_time&limit=5&access_token=${accessToken}`;
    const feedResponse = await fetch(feedUrl);
    const feedData = await feedResponse.json();

    return NextResponse.json({
      success: true,
      message: '✅ pages_read_engagement permission working',
      pageInfo: {
        id: pageInfo.id,
        name: pageInfo.name,
        followers: pageInfo.fan_count,
        about: pageInfo.about
      },
      recentPosts: feedData.data?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing pages_read_engagement:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

