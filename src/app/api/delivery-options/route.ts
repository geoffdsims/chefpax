import { NextResponse } from "next/server";
import { UberDirectAPI } from "@/lib/uber-direct-api";
import { RoadieAPI } from "@/lib/roadie-api";
import { getValidatedDeliveryOptions } from "@/lib/delivery-validation";

/**
 * Get available delivery options for the next 4 weeks
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryDate = searchParams.get("deliveryDate");
    const productIds = searchParams.get("productIds")?.split(',') || [];
    
    if (deliveryDate) {
      // Return inventory forecast for specific delivery date
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
      // Get delivery options with proper lead time validation
      const today = new Date();
      
      if (productIds.length > 0) {
        // Use the proper validation system for specific products
        const validation = getValidatedDeliveryOptions(productIds, today, 4);
        
        // Convert validation results to delivery options format
        const options = validation.map(opt => ({
          date: opt.date,
          available: opt.available,
          cutoffTime: "18:00",
          deliveryWindow: "9:00-13:00",
          capacityUsed: 30,
          maxCapacity: 50,
          currentOrders: 15,
          reason: opt.reason || undefined
        }));
        
        return NextResponse.json(options);
      } else {
        // Fallback: generate basic delivery options without product validation
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
    }
  } catch (error) {
    console.error("Error fetching delivery options:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery options" },
      { status: 500 }
    );
  }
}

