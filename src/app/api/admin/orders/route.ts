import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { nextDeliveryDateNow } from "@/lib/dates";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");

  const db = await getDb();
  
  // Get orders for the current delivery date or specified week
  let deliveryDate: Date;
  if (week) {
    // Parse week format YYYY-WW and calculate Friday of that week
    const [year, weekNum] = week.split("-").map(Number);
    const jan1 = new Date(year, 0, 1);
    const daysToFirstMonday = (8 - jan1.getDay()) % 7;
    const firstMonday = new Date(jan1);
    firstMonday.setDate(jan1.getDate() + daysToFirstMonday);
    
    const targetWeek = new Date(firstMonday);
    targetWeek.setDate(firstMonday.getDate() + (weekNum - 1) * 7 + 4); // Friday
    
    deliveryDate = targetWeek;
  } else {
    deliveryDate = nextDeliveryDateNow();
  }

  const startOfDay = new Date(deliveryDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(deliveryDate);
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await db.collection("orders")
    .find({
      deliveryDate: {
        $gte: startOfDay.toISOString(),
        $lte: endOfDay.toISOString()
      },
      status: { $ne: "refunded" }
    })
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json(orders);
}

