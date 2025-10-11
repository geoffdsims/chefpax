import { NextResponse } from 'next/server';
import { SocialMediaPostingService, HarvestPost } from '@/lib/social-media-posting';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, quantity, harvestDate, availableDate, imageUrl, specialNotes } = body;

    if (!productName || !quantity || !availableDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: productName, quantity, availableDate' 
      }, { status: 400 });
    }

    const harvest: HarvestPost = {
      productName,
      quantity,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      availableDate: new Date(availableDate),
      imageUrl,
      specialNotes
    };

    const results = await SocialMediaPostingService.postHarvestAnnouncement(harvest);

    return NextResponse.json({
      success: results.facebook || results.instagram,
      results: {
        facebook: results.facebook,
        instagram: results.instagram
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      message: results.facebook && results.instagram 
        ? 'Posted to all platforms successfully!'
        : results.facebook
        ? 'Posted to Facebook only'
        : results.instagram
        ? 'Posted to Instagram only'
        : 'Failed to post to any platform'
    });
  } catch (error: any) {
    console.error('Social media post error:', error);
    return NextResponse.json({ 
      error: 'Failed to post to social media', 
      message: error.message 
    }, { status: 500 });
  }
}

