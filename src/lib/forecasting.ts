import type { 
  WeeklyProduction, 
  InventoryForecast, 
  DeliveryOption, 
  Subscription 
} from "./schema";
import { getDb } from "./mongo";
import { calculateWeeklyInventory, getCurrentWeekString } from "./inventory";

/**
 * Enhanced inventory forecasting system for flexible ordering
 */

/**
 * Calculate delivery options for the next 4 weeks
 * Based on harvest cycles and production capacity
 */
export async function getDeliveryOptions(): Promise<DeliveryOption[]> {
  const options: DeliveryOption[] = [];
  const today = new Date();
  
  // Get current orders to calculate capacity usage
  const db = await getDb();
  const currentOrders = await db.collection("orders")
    .find({ 
      status: { $ne: "refunded" },
      deliveryDate: { $gte: today.toISOString() }
    })
    .toArray();

  // Get active subscriptions
  const subscriptions = await db.collection<Subscription>("subscriptions")
    .find({ status: "active" })
    .toArray();

  // Calculate max capacity per delivery (based on production)
  const maxCapacityPerDelivery = 50; // Adjust based on your delivery capacity

  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (weekOffset * 7));
    
    // Calculate delivery dates for this week
    const deliveryDates = getDeliveryDatesForWeek(weekStart);
    
    for (const deliveryDate of deliveryDates) {
      // Check if delivery date is in the past
      if (deliveryDate < today) continue;
      
      // Calculate orders for this delivery date
      const ordersForDate = currentOrders.filter(order => 
        new Date(order.deliveryDate).toDateString() === deliveryDate.toDateString()
      );
      
      // Calculate subscription orders for this date
      const subscriptionOrders = subscriptions.filter(sub => 
        new Date(sub.nextDeliveryDate).toDateString() === deliveryDate.toDateString()
      );
      
      const totalOrders = ordersForDate.length + subscriptionOrders.length;
      const capacityUsed = (totalOrders / maxCapacityPerDelivery) * 100;
      
      // Check if cutoff has passed
      const cutoffTime = getCutoffTimeForDelivery(deliveryDate);
      const cutoffDateTime = new Date(deliveryDate);
      const [hours, minutes] = cutoffTime.split(':').map(Number);
      cutoffDateTime.setHours(hours, minutes, 0, 0);
      
      const isAvailable = today < cutoffDateTime && capacityUsed < 90; // 90% capacity limit
      
      options.push({
        date: deliveryDate.toISOString(),
        available: isAvailable,
        cutoffTime,
        deliveryWindow: "9:00-13:00",
        capacityUsed,
        maxCapacity: maxCapacityPerDelivery,
        currentOrders: totalOrders
      });
    }
  }
  
  return options.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get delivery dates for a given week
 * Based on your production schedule and harvest cycles
 */
function getDeliveryDatesForWeek(weekStart: Date): Date[] {
  const deliveryDates: Date[] = [];
  
  // Friday delivery (current system)
  const friday = new Date(weekStart);
  friday.setDate(weekStart.getDate() + (5 - weekStart.getDay() + 7) % 7);
  deliveryDates.push(friday);
  
  // Tuesday delivery (additional option for mid-week harvest)
  const tuesday = new Date(weekStart);
  tuesday.setDate(weekStart.getDate() + (2 - weekStart.getDay() + 7) % 7);
  if (tuesday > new Date()) {
    deliveryDates.push(tuesday);
  }
  
  return deliveryDates;
}

/**
 * Get cutoff time for a delivery date
 * Different cutoff times based on harvest schedule
 */
function getCutoffTimeForDelivery(deliveryDate: Date): string {
  const dayOfWeek = deliveryDate.getDay();
  
  switch (dayOfWeek) {
    case 2: // Tuesday - cutoff Sunday night
      return "18:00";
    case 5: // Friday - cutoff Wednesday night
      return "18:00";
    default:
      return "18:00";
  }
}

/**
 * Get inventory forecast for a specific delivery date
 */
export async function getInventoryForecast(deliveryDate: string): Promise<InventoryForecast> {
  const db = await getDb();
  const date = new Date(deliveryDate);
  const weekString = getWeekString(date);
  
  // Get production plan for this week
  const production = getProductionForWeek(weekString);
  
  // Calculate available inventory
  const inventory = calculateWeeklyInventory(production);
  
  // Get existing orders for this delivery date
  const existingOrders = await db.collection("orders")
    .find({ 
      deliveryDate: deliveryDate,
      status: { $ne: "refunded" }
    })
    .toArray();
  
  // Get subscription orders for this date
  const subscriptions = await db.collection<Subscription>("subscriptions")
    .find({ 
      nextDeliveryDate: deliveryDate,
      status: "active"
    })
    .toArray();
  
  // Calculate reserved quantities
  const reserved: { [sku: string]: number } = {};
  const total: { [sku: string]: number } = {};
  
  // Initialize totals from production
  total["CHEFPAX_4OZ"] = inventory.chefMix4oz;
  total["SUNFLOWER_2OZ"] = inventory.sunflower2oz;
  total["PEA_2OZ"] = inventory.pea2oz;
  total["RADISH_2OZ"] = inventory.radish2oz;
  total["PEA_LIVE_TRAY"] = inventory.liveTrays.pea;
  total["RADISH_LIVE_TRAY"] = inventory.liveTrays.radish;
  
  // Initialize reserved
  Object.keys(total).forEach(sku => reserved[sku] = 0);
  
  // Calculate reserved from existing orders
  [...existingOrders, ...subscriptions].forEach(order => {
    order.items.forEach(item => {
      const sku = getSkuFromProductId(item.productId);
      if (sku && reserved[sku] !== undefined) {
        reserved[sku] += item.qty;
      }
    });
  });
  
  // Calculate available (total - reserved)
  const available: { [sku: string]: { available: number; reserved: number; total: number } } = {};
  Object.keys(total).forEach(sku => {
    available[sku] = {
      available: Math.max(0, total[sku] - reserved[sku]),
      reserved: reserved[sku],
      total: total[sku]
    };
  });
  
  return {
    week: weekString,
    deliveryDate,
    available,
    production
  };
}

/**
 * Helper function to get SKU from product ID
 */
function getSkuFromProductId(productId: string): string | null {
  // This would need to be implemented based on your product mapping
  // For now, return a placeholder
  return null;
}

/**
 * Get production plan for a specific week
 */
function getProductionForWeek(weekString: string): WeeklyProduction {
  // This could be enhanced to support different production plans
  // For now, return standard production
  return {
    week: weekString,
    pods: {
      pea: 12,
      sunflower: 12,
      radish: 6
    },
    flats: {
      pea: 4,
      sunflower: 3,
      radish: 6,
      amaranth: 1
    },
    liveTrayReservations: {
      pea: 1,
      radish: 2
    }
  };
}

/**
 * Get week string in format "2024-W01"
 */
function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}
