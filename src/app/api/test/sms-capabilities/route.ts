import { NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';

/**
 * Test endpoint to check SMS capabilities and send a test message
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testPhone = searchParams.get('phone');
  const action = searchParams.get('action'); // 'check' or 'send'

  try {
    // Check capabilities
    const capabilities = await SMSService.checkNumberCapabilities();

    if (action === 'send' && testPhone) {
      // Send a test SMS
      const result = await SMSService.sendOptInConfirmation(testPhone);
      
      return NextResponse.json({
        capabilities,
        testMessage: {
          sent: result,
          to: testPhone,
          message: 'Opt-in confirmation sent',
        },
      });
    }

    return NextResponse.json({
      success: true,
      capabilities,
      notes: {
        voice: capabilities?.voice 
          ? '✅ Voice: You CAN receive calls. Check Twilio Console for voicemail setup.'
          : '❌ Voice: Toll-free numbers typically do NOT support voice calls.',
        sms: capabilities?.sms 
          ? '✅ SMS: Fully enabled and verified!'
          : '❌ SMS: Not available',
        mms: capabilities?.mms 
          ? '✅ MMS: Can send images/media'
          : '❌ MMS: Text only',
      },
      webhookSetup: {
        incomingSMS: 'https://chefpax.com/api/twilio/sms-webhook',
        instructions: 'Configure in Twilio Console → Phone Numbers → Your Number → Messaging',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check SMS capabilities',
      message: error.message,
    }, { status: 500 });
  }
}

