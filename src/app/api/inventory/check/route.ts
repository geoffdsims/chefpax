import { NextResponse } from 'next/server';
import { InventoryAlertSystem } from '@/lib/inventory-alerts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Demo inventory data - in production this would come from database
    const inventory = [
      { productId: 'chefpax-mix', productName: 'ChefPax Mix', currentStock: 3, lowStockThreshold: 5, reorderPoint: 2, weeklyCapacity: 10 },
      { productId: 'pea-shoots', productName: 'Pea Shoots', currentStock: 8, lowStockThreshold: 5, reorderPoint: 2, weeklyCapacity: 12 }
    ];

    const preferences = {
      email: 'admin@chefpax.com',
      phone: '+15125551234',
      emailEnabled: true,
      smsEnabled: true
    };

    const results = await InventoryAlertSystem.checkInventoryLevels(inventory, preferences);
    const health = await InventoryAlertSystem.getInventoryHealth(inventory);

    return NextResponse.json({
      success: true,
      alertsSent: results.alertsSent,
      lowStockItems: results.lowStockItems.length,
      reorderItems: results.reorderItems.length,
      healthScore: health.healthScore,
      inventory: health
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

