import { NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';

/**
 * Twilio SMS Webhook Endpoint
 * Handles incoming SMS messages (STOP, HELP, START keywords)
 * 
 * Configure in Twilio Console:
 * Phone Numbers → Your Number → Messaging Configuration
 * "A message comes in" → Webhook → https://chefpax.com/api/twilio/sms-webhook
 * HTTP POST
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    console.log(`📱 Incoming SMS from ${from}: "${body}" (SID: ${messageSid})`);

    // Handle the message and get response
    const responseMessage = await SMSService.handleIncomingSMS(from, body);

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('❌ SMS webhook error:', error);
    
    // Return error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>We're sorry, there was an error processing your message. Please try again or contact alerts@chefpax.com</Message>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Twilio SMS webhook endpoint',
    note: 'Configure this URL in Twilio Console for incoming SMS',
    url: 'https://chefpax.com/api/twilio/sms-webhook',
  });
}

