import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getProductsWithInventory } from "@/lib/inventory";

interface OrderItem {
  productId: string;
  qty: number;
}

interface Order {
  items: OrderItem[];
}

export async function GET() {
  try {
    const db = await getDb();
    const products = getProductsWithInventory();
    
    // Get current week's production tasks
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    // Get completed harvest tasks for this week
    const harvestTasks = await db.collection("productionTasks")
      .find({
        stage: "HARVEST",
        status: "completed",
        scheduledDate: {
          $gte: weekStart.toISOString(),
          $lt: weekEnd.toISOString()
        }
      })
      .toArray();
    
    // Get orders for this week to calculate sold quantities
    const orders = await db.collection("orders").find({
      deliveryDate: {
        $gte: weekStart.toISOString().split('T')[0],
        $lt: weekEnd.toISOString().split('T')[0]
      },
      status: { $in: ["paid", "delivered"] }
    }).toArray();
    
    // Calculate real-time inventory for each product
    const inventoryStatus = products.map(product => {
      // Count harvested trays for this product
      const harvested = harvestTasks
        .filter(task => task.productId === product._id)
        .reduce((sum, task) => sum + (task.quantity || 0), 0);
      
      // Count sold trays for this product
      const sold = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum: number, item: any) => {
          return itemSum + (item.productId === product._id ? item.qty : 0);
        }, 0);
      }, 0);
      
      // Calculate available trays
      const available = Math.max(0, harvested - sold);
      const maxCapacity = product.weeklyCapacity || 0;
      
      // Determine status
      let status: string;
      let message: string;
      
      if (available > 0) {
        status = "ready_now";
        message = `${available} trays ready now!`;
      } else if (maxCapacity > 0) {
        status = "order_available";
        const leadTime = product.leadTimeDays || 0;
        const nextDelivery = new Date(today);
        nextDelivery.setDate(today.getDate() + leadTime + 1);
        message = `Order now for delivery ${nextDelivery.toLocaleDateString()} (${leadTime} days to grow)`;
      } else {
        status = "out_of_stock";
        message = "Currently out of stock";
      }
      
      return {
        productId: product._id,
        name: product.name,
        status,
        message,
        available,
        harvested,
        sold,
        maxCapacity,
        leadTimeDays: product.leadTimeDays || 0
      };
    });
    
    return NextResponse.json({
      week: `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getDate() - weekStart.getDay() + 1) / 7)}`,
      products: inventoryStatus,
      summary: {
        totalHarvested: harvestTasks.reduce((sum, task) => sum + (task.quantity || 0), 0),
        totalSold: orders.reduce((sum, order) => sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.qty, 0), 0),
        readyNow: inventoryStatus.filter(p => p.status === "ready_now").length,
        orderAvailable: inventoryStatus.filter(p => p.status === "order_available").length
      }
    });
    
  } catch (error) {
    console.error("Error calculating inventory:", error);
    return NextResponse.json({ error: "Failed to calculate inventory" }, { status: 500 });
  }
}