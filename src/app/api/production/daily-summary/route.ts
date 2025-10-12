import { NextResponse } from 'next/server';
import { SlackService } from '@/lib/slack-notifications';
import { getProductionSummary } from '@/lib/production-scheduler';

export async function GET() {
  try {
    const summary = await getProductionSummary();
    
    // Send Slack notification with daily summary
    const slackSent = await SlackService.sendDailySummary(summary);

    return NextResponse.json({
      success: true,
      summary,
      slackNotificationSent: slackSent,
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to generate daily summary:', error);
    return NextResponse.json({ error: 'Failed to generate daily summary' }, { status: 500 });
  }
}

// POST endpoint to manually trigger daily summary (for testing)
export async function POST() {
  return GET();
}
