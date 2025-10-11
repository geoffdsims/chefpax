import { NextResponse } from 'next/server';
import { SocialMediaPostingService, HarvestPost } from '@/lib/social-media-posting';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { harvests } = body;

    if (!harvests || !Array.isArray(harvests) || harvests.length === 0) {
      return NextResponse.json({ 
        error: 'harvests array is required and must not be empty' 
      }, { status: 400 });
    }

    const harvestPosts: HarvestPost[] = harvests.map((h: any) => ({
      productName: h.productName,
      quantity: h.quantity,
      harvestDate: h.harvestDate ? new Date(h.harvestDate) : new Date(),
      availableDate: new Date(h.availableDate),
      imageUrl: h.imageUrl,
      specialNotes: h.specialNotes
    }));

    const results = await SocialMediaPostingService.postWeeklySchedule(harvestPosts);

    return NextResponse.json({
      success: results.facebook || results.instagram,
      results: {
        facebook: results.facebook,
        instagram: results.instagram
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      message: results.facebook && results.instagram 
        ? 'Posted weekly schedule to all platforms!'
        : results.facebook
        ? 'Posted to Facebook only'
        : results.instagram
        ? 'Posted to Instagram only'
        : 'Failed to post to any platform'
    });
  } catch (error: any) {
    console.error('Social media weekly post error:', error);
    return NextResponse.json({ 
      error: 'Failed to post weekly schedule', 
      message: error.message 
    }, { status: 500 });
  }
}

