import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDb } from "@/lib/mongo";

/**
 * Create Stripe Customer Portal session
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const userId = (session.user as { id: string }).id;
    const db = await getDb();

    // Get or create Stripe customer
    let customerId: string;
    const existingProfile = await db.collection("userProfiles").findOne({ userId });
    
    if (existingProfile?.stripeCustomerId) {
      customerId = existingProfile.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name!,
        metadata: { userId },
      });
      
      customerId = customer.id;
      
      // Update user profile with Stripe customer ID
      await db.collection("userProfiles").updateOne(
        { userId },
        { 
          $set: { 
            stripeCustomerId: customerId,
            updatedAt: new Date().toISOString()
          } 
        }
      );
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}

/**
 * Get customer dashboard data
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const db = await getDb();

    // Get user profile
    const profile = await db.collection("userProfiles").findOne({ userId });
    
    // Get recent orders
    const orders = await db.collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get active subscriptions
    const subscriptions = await db.collection("subscriptions")
      .find({ userId, status: "active" })
      .toArray();

    // Get loyalty points
    const earnedPoints = await db.collection("loyaltyTransactions").aggregate([
      { $match: { userId, type: "earn" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]).toArray();

    const redeemedPoints = await db.collection("loyaltyTransactions").aggregate([
      { $match: { userId, type: "redeem" } },
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]).toArray();

    const currentPoints = (earnedPoints[0]?.total || 0) - (redeemedPoints[0]?.total || 0);

    // Get subscription tier benefits
    const tierBenefits = profile?.subscriptionTier ? 
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription-tiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierName: profile.subscriptionTier }),
      }).then(res => res.json()) : null;

    return NextResponse.json({
      profile,
      recentOrders: orders,
      activeSubscriptions: subscriptions,
      loyaltyPoints: {
        current: currentPoints,
        redemptionThreshold: parseInt(process.env.LOYALTY_REDEMPTION_THRESHOLD || "100"),
        canRedeem: currentPoints >= parseInt(process.env.LOYALTY_REDEMPTION_THRESHOLD || "100"),
      },
      tierBenefits,
    });
  } catch (error) {
    console.error("Error fetching customer dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer dashboard data" },
      { status: 500 }
    );
  }
}
