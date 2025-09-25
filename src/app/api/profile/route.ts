import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { UserProfile } from "@/lib/schema";
import { ObjectId } from "mongodb";

/**
 * Get user profile
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const profile = await db.collection<UserProfile>("userProfiles")
      .findOne({ userId: (session.user as { id: string }).id });

    if (!profile) {
      // Create default profile if none exists
      const defaultProfile: UserProfile = {
        userId: (session.user as { id: string }).id,
        email: session.user.email || "",
        name: session.user.name || "",
        defaultDeliveryAddress: {
          address1: "",
          city: "",
          state: "TX",
          zip: ""
        },
        deliveryPreferences: {
          preferredDay: 5, // Friday
          deliveryWindow: "9:00-13:00",
          autoRenew: true
        },
        subscriptionDiscount: 10, // 10% discount for subscribers
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await db.collection("userProfiles").insertOne(defaultProfile);
      return NextResponse.json({ ...defaultProfile, _id: result.insertedId.toString() });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      phone, 
      defaultDeliveryAddress, 
      deliveryPreferences,
      subscriptionDiscount 
    } = body;

    const db = await getDb();
    
    const updateData: Partial<UserProfile> = {
      updatedAt: new Date().toISOString()
    };

    if (phone !== undefined) updateData.phone = phone;
    if (defaultDeliveryAddress) updateData.defaultDeliveryAddress = defaultDeliveryAddress;
    if (deliveryPreferences) updateData.deliveryPreferences = deliveryPreferences;
    if (subscriptionDiscount !== undefined) updateData.subscriptionDiscount = subscriptionDiscount;

    const result = await db.collection("userProfiles").updateOne(
      { userId: (session.user as { id: string }).id },
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

/**
 * Delete user profile
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    
    // Also cancel any active subscriptions
    await db.collection("subscriptions").updateMany(
      { userId: (session.user as { id: string }).id },
      { $set: { status: "cancelled", updatedAt: new Date().toISOString() } }
    );

    await db.collection("userProfiles").deleteOne(
      { userId: (session.user as { id: string }).id }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return NextResponse.json(
      { error: "Failed to delete user profile" },
      { status: 500 }
    );
  }
}

