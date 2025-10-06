import { NextResponse } from 'next/server';
import { SocialMediaAutomation } from '@/lib/social-media-automation';

export async function GET() {
  try {
    const automation = new SocialMediaAutomation();
    
    // Test Instagram connection
    const connectionTest = await automation.testConnections();
    
    return NextResponse.json({
      success: true,
      connections: connectionTest,
      message: 'Instagram API test completed'
    });
  } catch (error: any) {
    console.error('Instagram API test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Instagram API test failed'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, imageUrl } = body;
    
    const automation = new SocialMediaAutomation();
    
    // Post to both platforms
    const result = await automation.postToBothPlatforms({
      message: message || 'Test post from ChefPax automation system! 🌱 #microgreens #test',
      imageUrl: imageUrl
    });
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Social media post completed'
    });
  } catch (error: any) {
    console.error('Social media post error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Social media post failed'
      },
      { status: 500 }
    );
  }
}
