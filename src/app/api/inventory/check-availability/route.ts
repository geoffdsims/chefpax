import { NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/inventory-reservation';

export const dynamic = 'force-dynamic';

/**
 * Check if product is available for a specific delivery date
 * 
 * GET /api/inventory/check-availability?traySize=10x20&quantity=2&deliveryDate=2025-10-18
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const traySize = searchParams.get('traySize') as '10x20' | '5x5';
    const quantity = parseInt(searchParams.get('quantity') || '1');
    const deliveryDateStr = searchParams.get('deliveryDate');
    
    if (!traySize || !deliveryDateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: traySize, deliveryDate' },
        { status: 400 }
      );
    }
    
    const deliveryDate = new Date(deliveryDateStr);
    
    if (isNaN(deliveryDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid delivery date format' },
        { status: 400 }
      );
    }
    
    const availability = await checkAvailability(traySize, quantity, deliveryDate);
    
    return NextResponse.json({
      success: true,
      ...availability
    });
    
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability', message: error.message },
      { status: 500 }
    );
  }
}

