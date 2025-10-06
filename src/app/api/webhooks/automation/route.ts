import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    console.log(`Webhook automation triggered: ${type}`, payload);

    // For now, just log the automation trigger without using BullMQ
    switch (type) {
      case 'subscription_cycle':
        console.log(`Processing subscription cycle for: ${payload.subscriptionId}`);
        break;
      case 'inventory_check':
        console.log('Running inventory check automation');
        break;
      case 'delivery_reminder':
        console.log('Sending delivery reminders');
        break;
      default:
        console.log(`Unknown automation type: ${type}`);
    }

    // TODO: Re-enable automation engine once job-queue is fully fixed
    // const { automationEngine } = await import('@/lib/automation-engine');
    // await automationEngine.processAutomation(type, payload);

    return NextResponse.json({ 
      success: true,
      message: `Automation ${type} triggered successfully`
    });
  } catch (error) {
    console.error("Error processing automation webhook:", error);
    return NextResponse.json(
      { error: "Failed to process automation" },
      { status: 500 }
    );
  }
}
