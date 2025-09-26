import { NextResponse } from "next/server";

/**
 * Get available delivery options for the next 4 weeks
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryDate = searchParams.get("deliveryDate");
    
    if (deliveryDate) {
      // Return a simple inventory forecast for specific delivery date
      const forecast = {
        week: "2024-W01",
        deliveryDate,
        available: {
          "CHEFPAX_MIX_LIVE_TRAY": { available: 15, reserved: 5, total: 20 },
          "PEA_LIVE_TRAY": { available: 12, reserved: 3, total: 15 },
          "RADISH_LIVE_TRAY": { available: 10, reserved: 2, total: 12 },
          "SUNFLOWER_LIVE_TRAY": { available: 8, reserved: 1, total: 9 },
          "AMARANTH_LIVE_TRAY": { available: 6, reserved: 1, total: 7 }
        }
      };
      return NextResponse.json(forecast);
    } else {
      // Return simple delivery options
      const today = new Date();
      const options = [];
      
      // Generate next 4 weeks of delivery options
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + (weekOffset * 7));
        
        // Friday delivery
        const friday = new Date(weekStart);
        friday.setDate(weekStart.getDate() + (5 - weekStart.getDay() + 7) % 7);
        
        if (friday > today) {
          options.push({
            date: friday.toISOString(),
            available: true,
            cutoffTime: "18:00",
            deliveryWindow: "9:00-13:00",
            capacityUsed: 30,
            maxCapacity: 50,
            currentOrders: 15
          });
        }
        
        // Tuesday delivery (if not past)
        const tuesday = new Date(weekStart);
        tuesday.setDate(weekStart.getDate() + (2 - weekStart.getDay() + 7) % 7);
        
        if (tuesday > today) {
          options.push({
            date: tuesday.toISOString(),
            available: true,
            cutoffTime: "18:00",
            deliveryWindow: "9:00-13:00",
            capacityUsed: 20,
            maxCapacity: 50,
            currentOrders: 10
          });
        }
      }
      
      return NextResponse.json(options.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
  } catch (error) {
    console.error("Error fetching delivery options:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery options" },
      { status: 500 }
    );
  }
}

