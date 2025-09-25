import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Subscription, UserProfile } from "@/lib/schema";
import { ObjectId } from "mongodb";

/**
 * Get user's subscriptions
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const subscriptions = await db.collection<Subscription>("subscriptions")
      .find({ userId: (session.user as { id: string }).id })
      .toArray();

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

/**
 * Create a new subscription
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      frequency, 
      deliveryDay, 
      nextDeliveryDate, 
      items, 
      deliveryFeeCents,
      autoRenew = true 
    } = body;

    const db = await getDb();
    const userId = (session.user as { id: string }).id;
    
    // Get user profile for delivery preferences and discount
    const profile = await db.collection<UserProfile>("userProfiles")
      .findOne({ userId });

    // Apply subscription discount to items
    const subscriptionDiscount = profile?.subscriptionDiscount || 10;
    const discountedItems = items.map((item: any) => ({
      ...item,
      priceCents: Math.round(item.priceCents * (1 - subscriptionDiscount / 100))
    }));

    const subscription: Subscription = {
      userId,
      status: "active",
      frequency,
      deliveryDay,
      nextDeliveryDate,
      items: discountedItems,
      deliveryFeeCents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoRenew
    };

    const result = await db.collection("subscriptions").insertOne(subscription);
    
    return NextResponse.json({ 
      success: true, 
      subscriptionId: result.insertedId.toString(),
      discountApplied: subscriptionDiscount
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

/**
 * Update subscription
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, updates } = body;

    const db = await getDb();
    
    const result = await db.collection("subscriptions").updateOne(
      { 
        _id: new ObjectId(subscriptionId),
        userId: (session.user as { id: string }).id 
      },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

/**
 * Cancel subscription
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get("subscriptionId");

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID required" }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.collection("subscriptions").updateOne(
      { 
        _id: new ObjectId(subscriptionId),
        userId: (session.user as { id: string }).id 
      },
      { 
        $set: { 
          status: "cancelled",
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
