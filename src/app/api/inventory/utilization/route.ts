import { NextResponse } from 'next/server';
import { getRackUtilization } from '@/lib/inventory-reservation';

export const dynamic = 'force-dynamic';

/**
 * Get current rack utilization
 * 
 * GET /api/inventory/utilization?startDate=2025-10-11&endDate=2025-10-18
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    
    const utilization = await getRackUtilization(startDate, endDate);
    
    return NextResponse.json({
      success: true,
      ...utilization,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error getting rack utilization:', error);
    return NextResponse.json(
      { error: 'Failed to get rack utilization', message: error.message },
      { status: 500 }
    );
  }
}

