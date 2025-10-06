import { NextResponse } from 'next/server';
import { UberDirectAPI } from '@/lib/uber-direct-api';

export async function GET() {
  try {
    const uberAPI = new UberDirectAPI(
      process.env.UBER_DIRECT_CLIENT_ID || '',
      process.env.UBER_DIRECT_CLIENT_SECRET || '',
      process.env.UBER_DIRECT_CUSTOMER_ID || ''
    );

    // Test delivery estimation
    const estimate = await uberAPI.estimateMicrogreenDelivery(
      'Austin, TX',
      'Austin, TX'
    );

    return NextResponse.json({
      success: true,
      estimate,
      message: 'Uber Direct API test completed'
    });
  } catch (error: any) {
    console.error('Uber Direct API test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Uber Direct API test failed'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pickupAddress, dropoffAddress, items } = body;
    
    const uberAPI = new UberDirectAPI(
      process.env.UBER_DIRECT_CLIENT_ID || '',
      process.env.UBER_DIRECT_CLIENT_SECRET || '',
      process.env.UBER_DIRECT_CUSTOMER_ID || ''
    );

    // Create test delivery (don't actually create in test mode)
    if (process.env.NODE_ENV === 'production') {
      const delivery = await uberAPI.createDelivery({
        pickupAddress: pickupAddress || {
          street: "123 Test St",
          city: "Austin",
          state: "TX",
          zip: "78701",
          country: "US"
        },
        dropoffAddress: dropoffAddress || {
          street: "456 Customer Ave",
          city: "Austin",
          state: "TX",
          zip: "78702",
          country: "US"
        },
        items: items || [{
          name: "Live Microgreen Tray",
          quantity: 1,
          price: 25.00
        }],
        specialInstructions: "Test delivery - handle with care"
      });

      return NextResponse.json({
        success: true,
        delivery,
        message: 'Uber Direct delivery created successfully'
      });
    } else {
      // Test mode - just return estimate
      const estimate = await uberAPI.estimateMicrogreenDelivery(
        'Austin, TX',
        'Austin, TX'
      );

      return NextResponse.json({
        success: true,
        estimate,
        message: 'Test mode - delivery estimate only'
      });
    }
  } catch (error: any) {
    console.error('Uber Direct delivery error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Uber Direct delivery failed'
      },
      { status: 500 }
    );
  }
}
