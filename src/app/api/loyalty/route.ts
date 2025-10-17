import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDb } from "@/lib/mongo";
import { calculatePointsEarned, getTier } from "@/lib/loyalty";

/**
 * GET /api/loyalty - Get user's loyalty account
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    let account = await db.collection('loyaltyAccounts').findOne({ 
      userId: session.user.email 
    });

    // Create account if doesn't exist
    if (!account) {
      account = {
        userId: session.user.email,
        points: 100, // Sign-up bonus
        lifetimePoints: 100,
        tier: 'seed',
        redeemedPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.collection('loyaltyAccounts').insertOne(account);
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error fetching loyalty account:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty account" }, { status: 500 });
  }
}

/**
 * POST /api/loyalty - Redeem points
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pointsToRedeem } = await req.json();
    
    if (pointsToRedeem < 100) {
      return NextResponse.json({ error: "Minimum 100 points to redeem" }, { status: 400 });
    }

    const db = await getDb();
    const account = await db.collection('loyaltyAccounts').findOne({ 
      userId: session.user.email 
    });

    if (!account || account.points < pointsToRedeem) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // Update account
    await db.collection('loyaltyAccounts').updateOne(
      { userId: session.user.email },
      { 
        $inc: { points: -pointsToRedeem, redeemedPoints: pointsToRedeem },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    // Log transaction
    await db.collection('loyaltyTransactions').insertOne({
      userId: session.user.email,
      points: -pointsToRedeem,
      type: 'redeemed',
      description: `Redeemed ${pointsToRedeem} points for $${pointsToRedeem / 10} discount`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, discountCents: (pointsToRedeem / 10) * 100 });
  } catch (error) {
    console.error("Error redeeming points:", error);
    return NextResponse.json({ error: "Failed to redeem points" }, { status: 500 });
  }
}
