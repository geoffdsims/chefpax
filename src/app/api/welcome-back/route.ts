import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDb } from "@/lib/mongo";
import { getWelcomeBackMessage } from "@/lib/orderLifecycle";
import type { Order } from "@/lib/schema";

/**
 * Get personalized welcome back experience for users
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
    const userProfile = await db.collection("userProfiles").findOne({ userId });
    
    // Get recent orders (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = await db.collection<Order>("orders")
      .find({ 
        userId,
        createdAt: { $gte: sixMonthsAgo.toISOString() }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get active subscriptions
    const activeSubscriptions = await db.collection("subscriptions")
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

    // Get welcome back message
    const welcomeMessage = getWelcomeBackMessage(userProfile, recentOrders);

    // Calculate customer insights
    const totalSpent = recentOrders.reduce((sum, order) => sum + order.totalCents, 0);
    const averageOrderValue = recentOrders.length > 0 ? totalSpent / recentOrders.length : 0;
    const favoriteProducts = getFavoriteProducts(recentOrders);
    const lastOrderDate = recentOrders.length > 0 ? new Date(recentOrders[0].createdAt) : null;
    const daysSinceLastOrder = lastOrderDate ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Generate personalized recommendations
    const recommendations = generateRecommendations({
      recentOrders,
      favoriteProducts,
      activeSubscriptions,
      currentPoints,
      daysSinceLastOrder,
    });

    // Get seasonal offers
    const seasonalOffers = getSeasonalOffers();

    return NextResponse.json({
      welcomeMessage,
      customerInsights: {
        totalOrders: recentOrders.length,
        totalSpent: totalSpent / 100, // Convert cents to dollars
        averageOrderValue: averageOrderValue / 100,
        favoriteProducts,
        lastOrderDate,
        daysSinceLastOrder,
        currentPoints,
        subscriptionTier: userProfile?.subscriptionTier || "basic",
      },
      activeSubscriptions: activeSubscriptions.length,
      recommendations,
      seasonalOffers,
      quickActions: [
        {
          title: "Track Your Orders",
          description: "See the status of your current orders",
          action: "track_orders",
          icon: "📦",
        },
        {
          title: "Manage Subscription",
          description: "Update your delivery preferences",
          action: "manage_subscription",
          icon: "🔄",
        },
        {
          title: "Redeem Points",
          description: `You have ${currentPoints} loyalty points available`,
          action: "redeem_points",
          icon: "⭐",
        },
        {
          title: "Shop Now",
          description: "Browse our fresh microgreens",
          action: "shop_now",
          icon: "🛒",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching welcome back data:", error);
    return NextResponse.json(
      { error: "Failed to fetch welcome back data" },
      { status: 500 }
    );
  }
}

/**
 * Get customer's favorite products based on order history
 */
function getFavoriteProducts(orders: Order[]): Array<{ productId: string; name: string; orderCount: number; totalQuantity: number }> {
  const productStats = new Map<string, { name: string; orderCount: number; totalQuantity: number }>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = productStats.get(item.productId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalQuantity += item.qty;
      } else {
        productStats.set(item.productId, {
          name: item.name,
          orderCount: 1,
          totalQuantity: item.qty,
        });
      }
    });
  });

  return Array.from(productStats.entries())
    .map(([productId, stats]) => ({ productId, ...stats }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5); // Top 5 favorite products
}

/**
 * Generate personalized product recommendations
 */
function generateRecommendations(data: {
  recentOrders: Order[];
  favoriteProducts: any[];
  activeSubscriptions: any[];
  currentPoints: number;
  daysSinceLastOrder: number | null;
}): Array<{ type: string; title: string; description: string; action: string; priority: number }> {
  const recommendations = [];

  // Recommend subscription if they have multiple orders but no subscription
  if (data.recentOrders.length >= 2 && data.activeSubscriptions.length === 0) {
    recommendations.push({
      type: "subscription",
      title: "Save 10% with a Subscription",
      description: "You order regularly - subscribe and save on every delivery!",
      action: "subscribe",
      priority: 1,
    });
  }

  // Recommend new varieties if they always order the same thing
  if (data.favoriteProducts.length > 0 && data.favoriteProducts[0].orderCount >= 3) {
    recommendations.push({
      type: "variety",
      title: "Try New Varieties",
      description: "You love our microgreens! Try some new varieties for variety in your meals.",
      action: "browse_varieties",
      priority: 2,
    });
  }

  // Recommend loyalty redemption if they have enough points
  if (data.currentPoints >= 100) {
    recommendations.push({
      type: "loyalty",
      title: "Redeem Your Loyalty Points",
      description: `You have ${data.currentPoints} points! Redeem them for discounts on your next order.`,
      action: "redeem_points",
      priority: 3,
    });
  }

  // Re-engagement if they haven't ordered in a while
  if (data.daysSinceLastOrder && data.daysSinceLastOrder > 14) {
    recommendations.push({
      type: "reengagement",
      title: "Welcome Back Special",
      description: "We've missed you! Here's a special discount to welcome you back.",
      action: "welcome_back_offer",
      priority: 1,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Get current seasonal offers
 */
function getSeasonalOffers(): Array<{ title: string; description: string; discount: string; validUntil: string; icon: string }> {
  const currentMonth = new Date().getMonth();
  
  // Spring offers (March-May)
  if (currentMonth >= 2 && currentMonth <= 4) {
    return [
      {
        title: "Spring Freshness Special",
        description: "New spring varieties now available",
        discount: "15% off all spring mixes",
        validUntil: "May 31st",
        icon: "🌸",
      },
    ];
  }
  
  // Summer offers (June-August)
  if (currentMonth >= 5 && currentMonth <= 7) {
    return [
      {
        title: "Summer Salad Special",
        description: "Perfect for summer salads and smoothies",
        discount: "10% off all varieties",
        validUntil: "August 31st",
        icon: "☀️",
      },
    ];
  }
  
  // Fall/Winter offers
  return [
    {
      title: "Holiday Freshness",
      description: "Keep your meals fresh through the holidays",
      discount: "12% off all orders",
      validUntil: "December 31st",
      icon: "🎄",
    },
  ];
}
