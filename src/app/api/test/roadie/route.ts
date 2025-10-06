import { NextResponse } from 'next/server';
import { RoadieAPI } from '@/lib/roadie-api';

export async function GET() {
  try {
    const roadieAPI = new RoadieAPI(
      process.env.ROADIE_CUSTOMER_ID || ''
    );

    // Test delivery estimation
    const estimate = await roadieAPI.estimateMicrogreenDelivery(
      'Austin, TX',
      'Austin, TX'
    );

    return NextResponse.json({
      success: true,
      estimate,
      message: 'Roadie API test completed'
    });
  } catch (error: any) {
    console.error('Roadie API test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Roadie API test failed'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pickupAddress, dropoffAddress, items } = body;
    
    const roadieAPI = new RoadieAPI(
      process.env.ROADIE_CUSTOMER_ID || ''
    );

    // Create test delivery (don't actually create in test mode)
    if (process.env.NODE_ENV === 'production') {
      const delivery = await roadieAPI.createDelivery({
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
          weight: 2,
          dimensions: {
            length: 12,
            width: 8,
            height: 4
          }
        }],
        specialInstructions: "Test delivery - handle with care",
        value: 25.00
      });

      return NextResponse.json({
        success: true,
        delivery,
        message: 'Roadie delivery created successfully'
      });
    } else {
      // Test mode - just return estimate
      const estimate = await roadieAPI.estimateMicrogreenDelivery(
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
    console.error('Roadie delivery error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Roadie delivery failed'
      },
      { status: 500 }
    );
  }
}
