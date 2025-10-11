import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasInstagramBusinessAccountId: !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    hasFacebookToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
    hasTwitterApiKey: !!process.env.TWITTER_API_KEY,
    instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'NOT SET',
  });
}






