import { NextResponse } from 'next/server';
import { createUberDirectAPI, DeliveryRequest } from '@/lib/uber-direct-api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      customerName, 
      customerPhone,
      deliveryAddress,
      items,
      deliveryInstructions,
      scheduledTime 
    } = body;

    // Validate required fields
    if (!orderId || !customerName || !customerPhone || !deliveryAddress || !items) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const uberAPI = createUberDirectAPI();

    if (!uberAPI) {
      // Demo mode - return mock success
      console.log('📦 [DEMO] Delivery scheduled:', {
        orderId,
        customerName,
        deliveryAddress
      });

      return NextResponse.json({
        success: true,
        demo: true,
        deliveryId: `DEMO-${Date.now()}`,
        trackingUrl: `https://chefpax.com/tracking/DEMO-${Date.now()}`,
        estimatedPickup: new Date(Date.now() + 1800000).toISOString(), // 30 min
        estimatedDelivery: new Date(Date.now() + 5400000).toISOString(), // 90 min
        message: 'Demo mode: Uber Direct not configured'
      });
    }

    // ChefPax pickup address (Austin HQ)
    const pickupAddress = {
      street: process.env.CHEFPAX_ADDRESS || '123 Farm Road',
      city: process.env.CHEFPAX_CITY || 'Austin',
      state: 'TX',
      zip: process.env.CHEFPAX_ZIP || '78701',
      country: 'US'
    };

    const deliveryRequest: DeliveryRequest = {
      orderId,
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress: {
        street: deliveryAddress.address1 + (deliveryAddress.address2 ? `, ${deliveryAddress.address2}` : ''),
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zip: deliveryAddress.zip,
        country: 'US'
      },
      items,
      deliveryInstructions,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined
    };

    const result = await uberAPI.createDelivery(deliveryRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        deliveryId: result.deliveryId,
        trackingUrl: result.trackingUrl,
        estimatedPickup: result.estimatedPickup,
        estimatedDelivery: result.estimatedDelivery,
        cost: result.cost
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Delivery scheduling error:', error);
    return NextResponse.json({ 
      error: 'Failed to schedule delivery', 
      message: error.message 
    }, { status: 500 });
  }
}

