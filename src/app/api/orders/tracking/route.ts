import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDb } from "@/lib/mongo";
import { calculateOrderTimeline, getMicrogreenStages, getDeliveryStatus } from "@/lib/orderLifecycle";
import type { Order } from "@/lib/schema";

/**
 * Get detailed order tracking information
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const email = searchParams.get("email");

    // Allow guest tracking by email or authenticated user access
    if (!session?.user && !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    let query: any = {};

    if (orderId) {
      query._id = orderId;
    } else if (email) {
      query.email = email;
    } else if (session?.user) {
      query.userId = (session.user as { id: string }).id;
    }

    const orders = await db.collection<Order>("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(orderId ? 1 : 10)
      .toArray();

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Enhance orders with tracking information
    const enhancedOrders = orders.map(order => {
      const orderDate = new Date(order.createdAt);
      const deliveryDate = new Date(order.deliveryDate);
      
      // Calculate lifecycle if not already present
      const lifecycle = order.lifecycle || calculateOrderTimeline(orderDate, deliveryDate);
      
      // Get microgreen growth stages
      const microgreenStages = getMicrogreenStages(order);
      
      // Get delivery status
      const deliveryStatus = getDeliveryStatus(order);

      return {
        ...order,
        lifecycle,
        microgreenStages,
        deliveryStatus,
        // Additional tracking info
        trackingInfo: {
          estimatedDeliveryWindow: order.deliveryWindow || "9:00 AM - 1:00 PM",
          deliveryInstructions: order.deliveryInstructions || "",
          specialNotes: order.specialNotes || "",
          trackingNumber: order.trackingNumber || `CP${order._id?.toString().slice(-8)}`,
        }
      };
    });

    return NextResponse.json({
      orders: enhancedOrders,
      total: enhancedOrders.length,
    });
  } catch (error) {
    console.error("Error fetching order tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch order tracking" },
      { status: 500 }
    );
  }
}

/**
 * Update order status (admin only)
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, allow any authenticated user (you can add role-based access later)

    const body = await req.json();
    const { orderId, status, trackingNumber, estimatedDeliveryTime, notes } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDeliveryTime) updateData.estimatedDeliveryTime = estimatedDeliveryTime;
    if (notes) updateData.specialNotes = notes;

    const result = await db.collection("orders").updateOne(
      { _id: orderId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Send status update notification (if user has email)
    try {
      const order = await db.collection("orders").findOne({ _id: orderId });
      if (order?.email) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/order-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: order.email,
            orderId,
            status,
            trackingNumber,
            estimatedDeliveryTime,
          }),
        });
      }
    } catch (notificationError) {
      console.error("Failed to send status notification:", notificationError);
      // Don't fail the main request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
