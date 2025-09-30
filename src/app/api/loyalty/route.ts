import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { LoyaltyTransaction } from "@/lib/schema";
import { ObjectId } from "mongodb";

/**
 * Get user's loyalty points and transaction history
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const db = await getDb();
    const userId = (session.user as { id: string }).id;

    // Get loyalty transactions
    const transactions = await db.collection<LoyaltyTransaction>("loyaltyTransactions")
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Calculate current points balance
    const earnedPoints = await db.collection("loyaltyTransactions").aggregate([
      { $match: { userId, type: "earn" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]).toArray();

    const redeemedPoints = await db.collection("loyaltyTransactions").aggregate([
      { $match: { userId, type: "redeem" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]).toArray();

    const currentPoints = (earnedPoints[0]?.total || 0) - (redeemedPoints[0]?.total || 0);

    // Get redemption threshold
    const redemptionThreshold = parseInt(process.env.LOYALTY_REDEMPTION_THRESHOLD || "100");

    return NextResponse.json({
      currentPoints,
      redemptionThreshold,
      canRedeem: currentPoints >= redemptionThreshold,
      transactions,
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty data:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty data" },
      { status: 500 }
    );
  }
}

/**
 * Earn loyalty points (called after successful orders)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, points, source, description, orderId } = body;

    if (!userId || !points || !source || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if points already awarded for this order
    if (orderId) {
      const existingTransaction = await db.collection("loyaltyTransactions")
        .findOne({ userId, orderId, source });
      
      if (existingTransaction) {
        return NextResponse.json(
          { error: "Points already awarded for this order" },
          { status: 409 }
        );
      }
    }

    // Apply multipliers based on source
    let finalPoints = points;
    const multiplier = process.env.LOYALTY_BONUS_MULTIPLIER_SUBSCRIPTION || "1.5";
    
    if (source === "subscription") {
      finalPoints = Math.round(points * parseFloat(multiplier));
    }

    const transaction: LoyaltyTransaction = {
      userId,
      type: "earn",
      points: finalPoints,
      source,
      orderId,
      description,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("loyaltyTransactions").insertOne(transaction);

    return NextResponse.json({
      success: true,
      transactionId: result.insertedId.toString(),
      pointsAwarded: finalPoints,
      originalPoints: points,
      multiplier: source === "subscription" ? multiplier : "1",
    });
  } catch (error) {
    console.error("Error awarding loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to award loyalty points" },
      { status: 500 }
    );
  }
}

/**
 * Redeem loyalty points
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pointsToRedeem, description } = body;

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return NextResponse.json(
        { error: "Invalid points amount" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const userId = (session.user as { id: string }).id;

    // Check current balance
    const earnedPoints = await db.collection("loyaltyTransactions").aggregate([
      { $match: { userId, type: "earn" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]).toArray();

    const redeemedPoints = await db.collection("loyaltyTransactions").aggregate([
      { $match: { userId, type: "redeem" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]).toArray();

    const currentPoints = (earnedPoints[0]?.total || 0) - (redeemedPoints[0]?.total || 0);

    if (currentPoints < pointsToRedeem) {
      return NextResponse.json(
        { error: "Insufficient loyalty points" },
        { status: 400 }
      );
    }

    const transaction: LoyaltyTransaction = {
      userId,
      type: "redeem",
      points: pointsToRedeem,
      source: "redemption",
      description: description || `Redeemed ${pointsToRedeem} points`,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("loyaltyTransactions").insertOne(transaction);

    return NextResponse.json({
      success: true,
      transactionId: result.insertedId.toString(),
      pointsRedeemed: pointsToRedeem,
      remainingPoints: currentPoints - pointsToRedeem,
    });
  } catch (error) {
    console.error("Error redeeming loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to redeem loyalty points" },
      { status: 500 }
    );
  }
}
