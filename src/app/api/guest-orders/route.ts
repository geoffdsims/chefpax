import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import type { GuestOrder } from "@/lib/schema";
import { ObjectId } from "mongodb";

/**
 * Create a guest order record
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, stripeSessionId, orderData, marketingOptIn } = body;

    if (!email || !stripeSessionId || !orderData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const guestOrder: GuestOrder = {
      email,
      stripeSessionId,
      orderData,
      createdAt: new Date().toISOString(),
      marketingOptIn: marketingOptIn || false,
    };

    const result = await db.collection("guestOrders").insertOne(guestOrder);
    
    return NextResponse.json({
      success: true,
      guestOrderId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating guest order:", error);
    return NextResponse.json(
      { error: "Failed to create guest order" },
      { status: 500 }
    );
  }
}

/**
 * Get guest orders by email (for account linking)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const guestOrders = await db.collection<GuestOrder>("guestOrders")
      .find({ email, linkedToAccount: { $exists: false } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(guestOrders);
  } catch (error) {
    console.error("Error fetching guest orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch guest orders" },
      { status: 500 }
    );
  }
}

/**
 * Link guest orders to a new account
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, userId } = body;

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const result = await db.collection("guestOrders").updateMany(
      { email, linkedToAccount: { $exists: false } },
      { 
        $set: { 
          linkedToAccount: userId,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      linkedOrders: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error linking guest orders:", error);
    return NextResponse.json(
      { error: "Failed to link guest orders" },
      { status: 500 }
    );
  }
}
