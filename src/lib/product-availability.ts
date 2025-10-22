/**
 * Product Availability System
 * 
 * Shows clear product status: "Ready Now" vs "Order Available"
 * Based on lead times and current inventory
 */

import { getProductsWithInventory } from "./inventory";
import { getDb } from "./mongo";

export type ProductAvailabilityStatus = 
  | "ready_now"           // In stock, can deliver next delivery day
  | "order_available"     // Can order, but needs lead time
  | "out_of_stock"        // No capacity available
  | "coming_soon"         // Not yet available for order

export interface ProductAvailability {
  productId: string;
  status: ProductAvailabilityStatus;
  message: string;
  nextAvailableDate?: string;
  leadTimeDays: number;
  currentStock: number;
  maxCapacity: number;
  canDeliverBy: string[];
}

/**
 * Get availability status for all products
 */
export async function getAllProductAvailability(): Promise<ProductAvailability[]> {
  const products = getProductsWithInventory();
  const availabilities: ProductAvailability[] = [];
  
  for (const product of products) {
    const availability = await getProductAvailability(product._id);
    availabilities.push(availability);
  }
  
  return availabilities;
}

/**
 * Get availability status for a specific product
 */
export async function getProductAvailability(productId: string): Promise<ProductAvailability> {
  const products = getProductsWithInventory();
  const product = products.find(p => p._id === productId || p.sku === productId);
  
  if (!product) {
    return {
      productId,
      status: "out_of_stock",
      message: "Product not found",
      leadTimeDays: 0,
      currentStock: 0,
      maxCapacity: 0,
      canDeliverBy: []
    };
  }

  const leadTimeDays = product.leadTimeDays || 0;
  const maxCapacity = product.weeklyCapacity || 0;
  
  // Get current stock from database
  const currentStock = await getCurrentProductStock(productId);
  
  // Calculate next available delivery dates
  const canDeliverBy = getAvailableDeliveryDates(leadTimeDays);
  
  // Determine status
  let status: ProductAvailabilityStatus;
  let message: string;
  let nextAvailableDate: string | undefined;

  if (currentStock > 0) {
    // We have stock ready now
    status = "ready_now";
    message = `Ready now! ${currentStock} available for next delivery`;
  } else if (maxCapacity > 0) {
    // Can order but needs lead time
    status = "order_available";
    const nextDelivery = canDeliverBy[0];
    nextAvailableDate = nextDelivery;
    message = `Order now for delivery ${new Date(nextDelivery).toLocaleDateString()} (${leadTimeDays} days to grow)`;
  } else {
    // No capacity
    status = "out_of_stock";
    message = "Currently out of stock";
  }

  return {
    productId,
    status,
    message,
    nextAvailableDate,
    leadTimeDays,
    currentStock,
    maxCapacity,
    canDeliverBy
  };
}

/**
 * Get current stock for a product from database
 */
async function getCurrentProductStock(productId: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    // Get current week's production
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week
    
    // Get production tasks for this week
    const productionTasks = await db.collection("productionTasks")
      .find({
        productId,
        stage: "HARVEST",
        scheduledDate: {
          $gte: weekStart.toISOString(),
          $lte: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: "completed"
      })
      .toArray();

    // Calculate total harvested this week
    const totalHarvested = productionTasks.reduce((sum, task) => sum + (task.quantity || 0), 0);
    
    // Get orders for this week to calculate remaining stock
    const orders = await db.collection("orders")
      .find({
        "items.productId": productId,
        deliveryDate: {
          $gte: weekStart.toISOString(),
          $lte: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: { $in: ["paid", "delivered"] }
      })
      .toArray();

    const totalOrdered = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum: number, item: any) => {
        return itemSum + (item.productId === productId ? item.qty : 0);
      }, 0);
    }, 0);

    return Math.max(0, totalHarvested - totalOrdered);
  } catch (error) {
    console.error("Error getting current stock:", error);
    return 0;
  }
}

/**
 * Get available delivery dates based on lead time
 */
function getAvailableDeliveryDates(leadTimeDays: number): string[] {
  const today = new Date();
  const availableDates: string[] = [];
  
  // Start from tomorrow (can't deliver same day)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 1);
  
  // Check next 4 weeks
  for (let i = 0; i < 28; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    // Only Tuesday, Thursday, Saturday (delivery days)
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek !== 2 && dayOfWeek !== 4 && dayOfWeek !== 5) {
      continue;
    }
    
    // Check if we have enough time from now to this delivery date
    const timeUntilDelivery = checkDate.getTime() - today.getTime();
    const daysUntilDelivery = timeUntilDelivery / (1000 * 60 * 60 * 24);
    
    // Need at least lead time + 1 day buffer
    if (daysUntilDelivery >= leadTimeDays + 1) {
      availableDates.push(checkDate.toISOString());
    }
  }
  
  return availableDates;
}

/**
 * Get availability status for cart items
 */
export async function getCartAvailabilityStatus(
  cart: Array<{ productId: string; qty: number }>
): Promise<{
  canCheckout: boolean;
  items: Array<{
    productId: string;
    qty: number;
    availability: ProductAvailability;
    canFulfill: boolean;
  }>;
  earliestDelivery: string;
  warnings: string[];
}> {
  const items = [];
  const warnings: string[] = [];
  let earliestDelivery = "";
  
  for (const item of cart) {
    const availability = await getProductAvailability(item.productId);
    const canFulfill = availability.status === "ready_now" || availability.status === "order_available";
    
    if (!canFulfill) {
      warnings.push(`${item.productId}: ${availability.message}`);
    }
    
    if (availability.canDeliverBy.length > 0) {
      const itemEarliest = availability.canDeliverBy[0];
      if (!earliestDelivery || new Date(itemEarliest) < new Date(earliestDelivery)) {
        earliestDelivery = itemEarliest;
      }
    }
    
    items.push({
      productId: item.productId,
      qty: item.qty,
      availability,
      canFulfill
    });
  }
  
  const canCheckout = items.every(item => item.canFulfill);
  
  return {
    canCheckout,
    items,
    earliestDelivery,
    warnings
  };
}

/**
 * Get status badge color for UI
 */
export function getAvailabilityBadgeColor(status: ProductAvailabilityStatus): "success" | "warning" | "error" | "info" {
  switch (status) {
    case "ready_now":
      return "success";
    case "order_available":
      return "warning";
    case "out_of_stock":
      return "error";
    case "coming_soon":
      return "info";
    default:
      return "info";
  }
}

/**
 * Get status icon for UI
 */
export function getAvailabilityIcon(status: ProductAvailabilityStatus): string {
  switch (status) {
    case "ready_now":
      return "✅";
    case "order_available":
      return "⏰";
    case "out_of_stock":
      return "❌";
    case "coming_soon":
      return "🔜";
    default:
      return "❓";
  }
}
