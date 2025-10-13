import { NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';

/**
 * Check Twilio number capabilities
 * Tests if the toll-free number supports voice, SMS, and MMS
 */
export async function GET() {
  try {
    const capabilities = await SMSService.checkNumberCapabilities();

    if (!capabilities) {
      return NextResponse.json({
        error: 'Unable to check capabilities. Twilio may not be configured.',
        env: {
          accountSid: !!process.env.TWILIO_ACCOUNT_SID,
          authToken: !!process.env.TWILIO_AUTH_TOKEN,
          phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not set',
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      capabilities,
      notes: {
        voice: capabilities.voice 
          ? '✅ Voice calls supported - You can receive calls and check voicemail'
          : '❌ Voice calls NOT supported - SMS/MMS only',
        sms: capabilities.sms 
          ? '✅ SMS supported'
          : '❌ SMS NOT supported',
        mms: capabilities.mms 
          ? '✅ MMS supported - Can send images'
          : '❌ MMS NOT supported - Text only',
      },
      voicemail: capabilities.voice 
        ? 'Configure voicemail in Twilio Console → Phone Numbers → Voice & Fax → Accept Incoming Voice Calls'
        : 'Not available - toll-free numbers typically do not support voice',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check capabilities',
      message: error.message,
    }, { status: 500 });
  }
}

