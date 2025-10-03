import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { automationEngine } from "@/lib/automation-engine";
import type { ProductionTask } from "@/lib/schema-automation";

export async function GET() {
  try {
    const db = await getDb();
    
    // Get all production tasks with product details
    const tasks = await db.collection<ProductionTask>("productionTasks")
      .aggregate([
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $sort: {
            priority: 1,
            runAt: 1
          }
        }
      ])
      .toArray();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching production tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch production tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, productId, quantity, deliveryDate, type } = body;

    if (!productId || !quantity || !deliveryDate) {
      return NextResponse.json(
        { error: "Missing required fields: productId, quantity, deliveryDate" },
        { status: 400 }
      );
    }

    // Create production tasks
    const tasks = await automationEngine.createProductionTasksFromOrder(
      orderId || `manual-${Date.now()}`,
      productId,
      quantity,
      deliveryDate
    );

    return NextResponse.json({ 
      success: true, 
      tasks,
      message: `Created ${tasks.length} production tasks`
    });
  } catch (error) {
    console.error("Error creating production tasks:", error);
    return NextResponse.json(
      { error: "Failed to create production tasks" },
      { status: 500 }
    );
  }
}
