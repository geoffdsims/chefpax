import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import type { DeliveryJob } from "@/lib/schema-automation";

export async function GET() {
  try {
    const db = await getDb();
    
    // Get all delivery jobs with order details
    const deliveries = await db.collection<DeliveryJob>("deliveryJobs")
      .aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order"
          }
        },
        {
          $sort: {
            scheduledFor: 1,
            createdAt: -1
          }
        }
      ])
      .toArray();

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching delivery jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery jobs" },
      { status: 500 }
    );
  }
}
