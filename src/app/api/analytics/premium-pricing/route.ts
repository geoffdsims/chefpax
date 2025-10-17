import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

/**
 * Get premium pricing analytics
 * Track acceptance rate of premium-priced products
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d
    
    const db = await getDb();
    
    // Calculate timestamp based on timeframe
    const now = new Date();
    let since: Date;
    
    switch (timeframe) {
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        since = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
      default:
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    // Get completed orders
    const orders = await db.collection('orders')
      .find({
        createdAt: { $gte: since.toISOString() },
        status: { $in: ['paid', 'completed', 'delivered'] }
      })
      .toArray();
    
    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group by product
    const productStats = new Map<string, {
      name: string;
      orders: number;
      revenue: number;
      avgPrice: number;
    }>();
    
    orders.forEach(order => {
      if (order.cart && Array.isArray(order.cart)) {
        order.cart.forEach((item: any) => {
          const key = item.productId || item.name;
          const existing = productStats.get(key) || {
            name: item.name || key,
            orders: 0,
            revenue: 0,
            avgPrice: 0,
          };
          
          existing.orders += item.quantity || 1;
          existing.revenue += (item.priceCents || 0) * (item.quantity || 1);
          
          productStats.set(key, existing);
        });
      }
    });
    
    // Calculate average prices
    const productArray = Array.from(productStats.values()).map(stat => ({
      ...stat,
      avgPrice: stat.orders > 0 ? Math.round(stat.revenue / stat.orders) : 0,
    }));
    
    // Sort by revenue
    productArray.sort((a, b) => b.revenue - a.revenue);
    
    // Calculate subscription metrics
    const subscriptions = await db.collection('subscriptions')
      .find({
        createdAt: { $gte: since.toISOString() }
      })
      .toArray();
    
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const subscriptionRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => sum + (sub.amount || 0), 0);
    
    // Premium pricing acceptance metrics
    const premiumProducts = productArray.filter(p => p.avgPrice > 3000); // $30+ is premium
    const premiumRevenue = premiumProducts.reduce((sum, p) => sum + p.revenue, 0);
    const premiumPercentage = totalRevenue > 0 
      ? Math.round((premiumRevenue / totalRevenue) * 100) 
      : 0;
    
    const metrics = {
      overview: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue / 100), // Convert to dollars
        avgOrderValue: Math.round(avgOrderValue / 100),
        activeSubscriptions,
        subscriptionRevenue: Math.round(subscriptionRevenue / 100),
      },
      premiumPricing: {
        premiumProductCount: premiumProducts.length,
        premiumRevenue: Math.round(premiumRevenue / 100),
        premiumPercentage,
        acceptanceRate: premiumPercentage, // Same as percentage for now
      },
      topProducts: productArray.slice(0, 10).map(p => ({
        name: p.name,
        orders: p.orders,
        revenue: Math.round(p.revenue / 100),
        avgPrice: Math.round(p.avgPrice / 100),
      })),
      revenueBreakdown: {
        oneTime: Math.round((totalRevenue - subscriptionRevenue) / 100),
        subscription: Math.round(subscriptionRevenue / 100),
      },
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching premium pricing analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

