import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import type { Product } from "@/lib/schema";

/**
 * GET - Fetch all products with subscription settings
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const products = await db.collection<Product>("products")
      .find({ active: true })
      .sort({ sort: 1 })
      .toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching subscription settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update subscription settings for a product
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      productId, 
      subscriptionEnabled, 
      subscriptionPriceCents, 
      stripeSubscriptionPriceId,
      subscriptionDiscount 
    } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const db = await getDb();
    const updateData: Partial<Product> = {};
    
    if (subscriptionEnabled !== undefined) {
      updateData.subscriptionEnabled = subscriptionEnabled;
    }
    if (subscriptionPriceCents !== undefined) {
      updateData.subscriptionPriceCents = subscriptionPriceCents;
    }
    if (stripeSubscriptionPriceId !== undefined) {
      updateData.stripeSubscriptionPriceId = stripeSubscriptionPriceId;
    }
    if (subscriptionDiscount !== undefined) {
      updateData.subscriptionDiscount = subscriptionDiscount;
    }

    const result = await db.collection<Product>("products")
      .updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscription settings updated" 
    });
  } catch (error) {
    console.error("Error updating subscription settings:", error);
    return NextResponse.json(
      { error: "Failed to update subscription settings" },
      { status: 500 }
    );
  }
}

/**
 * POST - Bulk update subscription settings
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { updates } = body; // Array of { productId, subscriptionEnabled, ... }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Updates must be an array" }, { status: 400 });
    }

    const db = await getDb();
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: new ObjectId(update.productId) },
        update: { 
          $set: {
            subscriptionEnabled: update.subscriptionEnabled,
            subscriptionPriceCents: update.subscriptionPriceCents,
            stripeSubscriptionPriceId: update.stripeSubscriptionPriceId,
            subscriptionDiscount: update.subscriptionDiscount
          }
        }
      }
    }));

    const result = await db.collection<Product>("products")
      .bulkWrite(bulkOps);

    return NextResponse.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      message: `Updated ${result.modifiedCount} products` 
    });
  } catch (error) {
    console.error("Error bulk updating subscription settings:", error);
    return NextResponse.json(
      { error: "Failed to bulk update subscription settings" },
      { status: 500 }
    );
  }
}
