import { NextResponse } from 'next/server';
import { SMSService } from '@/lib/sms-service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, type = 'order_confirmation' } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!SMSService.validatePhoneNumber(phone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Must include country code (e.g., +15125551234)' 
      }, { status: 400 });
    }

    let success = false;
    const testOrderNumber = `TEST-${Date.now()}`;
    const tomorrow = new Date(Date.now() + 86400000).toISOString();

    switch (type) {
      case 'order_confirmation':
        success = await SMSService.sendOrderConfirmation({
          customerPhone: phone,
          orderNumber: testOrderNumber,
          deliveryDate: tomorrow,
          trackingUrl: 'https://chefpax.com/account'
        });
        break;

      case 'out_for_delivery':
        success = await SMSService.sendDeliveryUpdate({
          customerPhone: phone,
          orderNumber: testOrderNumber,
          status: 'out_for_delivery',
          estimatedTime: '2:00 PM',
          trackingUrl: 'https://chefpax.com/account'
        });
        break;

      case 'delivered':
        success = await SMSService.sendDeliveryUpdate({
          customerPhone: phone,
          orderNumber: testOrderNumber,
          status: 'delivered'
        });
        break;

      case 'delivery_reminder':
        success = await SMSService.sendDeliveryReminder(phone, testOrderNumber, tomorrow);
        break;

      case 'harvest_notification':
        success = await SMSService.sendHarvestNotification(phone, 'ChefPax Mix Live Tray');
        break;

      default:
        return NextResponse.json({ error: 'Invalid SMS type' }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'SMS sent successfully (check console for demo mode output)',
        demoMode: !process.env.TWILIO_ACCOUNT_SID
      });
    } else {
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('SMS test error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test SMS', 
      message: error.message 
    }, { status: 500 });
  }
}

