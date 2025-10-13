import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

/**
 * Admin Analytics API
 * Provides aggregated metrics for business intelligence
 */
export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();
    
    // Calculate date ranges
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Revenue metrics
    const orders = await db.collection('orders').find({}).toArray();
    
    const revenue = {
      today: orders
        .filter(o => new Date(o.createdAt) >= startOfToday)
        .reduce((sum, o) => sum + (o.totalCents || 0), 0),
      week: orders
        .filter(o => new Date(o.createdAt) >= startOfWeek)
        .reduce((sum, o) => sum + (o.totalCents || 0), 0),
      month: orders
        .filter(o => new Date(o.createdAt) >= startOfMonth)
        .reduce((sum, o) => sum + (o.totalCents || 0), 0),
      year: orders
        .filter(o => new Date(o.createdAt) >= startOfYear)
        .reduce((sum, o) => sum + (o.totalCents || 0), 0),
    };

    // Order counts
    const orderCounts = {
      today: orders.filter(o => new Date(o.createdAt) >= startOfToday).length,
      week: orders.filter(o => new Date(o.createdAt) >= startOfWeek).length,
      month: orders.filter(o => new Date(o.createdAt) >= startOfMonth).length,
      total: orders.length,
    };

    // Customer metrics
    const uniqueEmails = new Set(orders.map(o => o.email));
    const customerCounts = {
      total: uniqueEmails.size,
      new: orders
        .filter(o => new Date(o.createdAt) >= startOfMonth)
        .map(o => o.email)
        .filter((email, index, self) => self.indexOf(email) === index).length,
      returning: 0, // Calculate based on multiple orders
    };

    // Count returning customers
    const emailOrderCounts = new Map<string, number>();
    orders.forEach(o => {
      const count = emailOrderCounts.get(o.email) || 0;
      emailOrderCounts.set(o.email, count + 1);
    });
    customerCounts.returning = Array.from(emailOrderCounts.values()).filter(count => count > 1).length;

    // Top selling products
    const productSales = new Map<string, { count: number; revenue: number }>();
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const existing = productSales.get(item.name) || { count: 0, revenue: 0 };
        productSales.set(item.name, {
          count: existing.count + item.qty,
          revenue: existing.revenue + (item.priceCents * item.qty),
        });
      });
    });

    const topSelling = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalProductsSold = Array.from(productSales.values())
      .reduce((sum, p) => sum + p.count, 0);

    // Production metrics
    const tasks = await db.collection('productionTasks').find({}).toArray();
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'READY').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return NextResponse.json({
      revenue,
      orders: orderCounts,
      customers: customerCounts,
      products: {
        topSelling,
        totalSold: totalProductsSold,
      },
      production: {
        tasksCompleted: completedTasks,
        tasksPending: pendingTasks,
        completionRate,
      },
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error.message },
      { status: 500 }
    );
  }
}

