import { NextResponse } from "next/server";
import { getDeliveryOptions, getInventoryForecast } from "@/lib/forecasting";

/**
 * Get available delivery options for the next 4 weeks
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryDate = searchParams.get("deliveryDate");
    
    if (deliveryDate) {
      // Get inventory forecast for specific delivery date
      const forecast = await getInventoryForecast(deliveryDate);
      return NextResponse.json(forecast);
    } else {
      // Get all delivery options
      const options = await getDeliveryOptions();
      return NextResponse.json(options);
    }
  } catch (error) {
    console.error("Error fetching delivery options:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery options" },
      { status: 500 }
    );
  }
}

