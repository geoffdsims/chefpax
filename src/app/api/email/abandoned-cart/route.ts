import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerEmail, customerName, cartItems, cartTotal, checkoutUrl } = body;

    if (!customerEmail || !cartItems?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const abandonedCartData = {
      customerName: customerName || customerEmail,
      items: cartItems.map((item: any) => ({
        name: item.name || 'Microgreens',
        quantity: item.quantity || 1,
        price: item.price || 0,
        imageUrl: item.imageUrl
      })),
      cartTotal: cartTotal || 0,
      checkoutUrl: checkoutUrl || 'https://chefpax.com/cart'
    };

    const success = await EmailService.sendAbandonedCartReminder(abandonedCartData, 1);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Abandoned cart reminder sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send abandoned cart reminder' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Abandoned cart email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send abandoned cart reminder',
      details: error.message 
    }, { status: 500 });
  }
}
