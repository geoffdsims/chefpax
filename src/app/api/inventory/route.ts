import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getStandardWeeklyProduction, calculateWeeklyInventory } from "@/lib/inventory";

export async function GET() {
  try {
    // Get current week's production plan
    const production = getStandardWeeklyProduction();
    
    // Calculate current inventory
    const inventory = calculateWeeklyInventory(production);
    
    // Get current orders for this week's delivery to calculate remaining availability
    const db = await getDb();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (5 - deliveryDate.getDay())); // Next Friday
    deliveryDate.setHours(0, 0, 0, 0);
    
    const orders = await db.collection("orders").find({
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      status: { $in: ["paid", "delivered"] }
    }).toArray();
    
    // Calculate sold quantities
    const soldQuantities = {
      chefMix4oz: 0,
      sunflower2oz: 0,
      pea2oz: 0,
      radish2oz: 0,
      liveTrayPea: 0,
      liveTrayRadish: 0
    };
    
    orders.forEach(order => {
      order.items.forEach(item => {
        switch (item.productId) {
          case 'CHEFPAX_4OZ':
            soldQuantities.chefMix4oz += item.qty;
            break;
          case 'SUNFLOWER_2OZ':
            soldQuantities.sunflower2oz += item.qty;
            break;
          case 'PEA_2OZ':
            soldQuantities.pea2oz += item.qty;
            break;
          case 'RADISH_2OZ':
            soldQuantities.radish2oz += item.qty;
            break;
          case 'PEA_LIVE_TRAY':
            soldQuantities.liveTrayPea += item.qty;
            break;
          case 'RADISH_LIVE_TRAY':
            soldQuantities.liveTrayRadish += item.qty;
            break;
        }
      });
    });
    
    // Calculate remaining availability
    const available = {
      chefMix4oz: Math.max(0, inventory.chefMix4oz - soldQuantities.chefMix4oz),
      sunflower2oz: Math.max(0, inventory.sunflower2oz - soldQuantities.sunflower2oz),
      pea2oz: Math.max(0, inventory.pea2oz - soldQuantities.pea2oz),
      radish2oz: Math.max(0, inventory.radish2oz - soldQuantities.radish2oz),
      liveTrayPea: Math.max(0, inventory.liveTrays.pea - soldQuantities.liveTrayPea),
      liveTrayRadish: Math.max(0, inventory.liveTrays.radish - soldQuantities.liveTrayRadish)
    };
    
    return NextResponse.json({
      week: production.week,
      production: inventory,
      sold: soldQuantities,
      available,
      deliveryDate: deliveryDate.toISOString().split('T')[0]
    });
    
  } catch (error) {
    console.error("Error calculating inventory:", error);
    return NextResponse.json({ error: "Failed to calculate inventory" }, { status: 500 });
  }
}
