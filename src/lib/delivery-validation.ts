/**
 * Delivery Date Validation System
 * 
 * Ensures products can be ready by the requested delivery date
 * based on their lead times and grow cycles
 */

import { getProductsWithInventory } from "./inventory";

export interface DeliveryValidationResult {
  canDeliver: boolean;
  reason?: string;
  earliestDelivery?: string;
  leadTimeDays?: number;
}

/**
 * Check if a product can be delivered by a specific date
 */
export function canDeliverByDate(
  productId: string, 
  deliveryDate: string, 
  orderTime: Date = new Date()
): DeliveryValidationResult {
  const products = getProductsWithInventory();
  const product = products.find(p => p._id === productId || p.sku === productId);
  
  if (!product) {
    return {
      canDeliver: false,
      reason: "Product not found"
    };
  }

  const delivery = new Date(deliveryDate);
  const leadTimeDays = product.leadTimeDays || 0;
  
  // Calculate the latest time we can start growing to meet delivery date
  const latestStartDate = new Date(delivery);
  latestStartDate.setDate(delivery.getDate() - leadTimeDays);
  
  // Check if we have enough time from now to start growing
  const timeUntilStart = latestStartDate.getTime() - orderTime.getTime();
  const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
  
  // Need at least 2 hours buffer for processing and setup
  if (hoursUntilStart < 2) {
    // Calculate earliest possible delivery date
    const earliestDelivery = new Date(orderTime);
    earliestDelivery.setDate(orderTime.getDate() + leadTimeDays + 1); // +1 for safety buffer
    
    return {
      canDeliver: false,
      reason: `${product.name} needs ${leadTimeDays} days to grow. Earliest delivery: ${earliestDelivery.toLocaleDateString()}`,
      earliestDelivery: earliestDelivery.toISOString(),
      leadTimeDays
    };
  }

  return {
    canDeliver: true,
    leadTimeDays
  };
}

/**
 * Get available delivery dates for a specific product
 */
export function getAvailableDeliveryDates(
  productId: string,
  orderTime: Date = new Date(),
  maxWeeks: number = 4
): string[] {
  const products = getProductsWithInventory();
  const product = products.find(p => p._id === productId || p.sku === productId);
  
  if (!product) {
    return [];
  }

  const leadTimeDays = product.leadTimeDays || 0;
  const availableDates: string[] = [];
  
  // Start from tomorrow (can't deliver same day)
  const startDate = new Date(orderTime);
  startDate.setDate(startDate.getDate() + 1);
  
  // Check each day for the next 4 weeks
  for (let i = 0; i < maxWeeks * 7; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    // Only check Tuesday, Thursday, Saturday (delivery days)
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek !== 2 && dayOfWeek !== 4 && dayOfWeek !== 5) {
      continue;
    }
    
    const validation = canDeliverByDate(productId, checkDate.toISOString(), orderTime);
    if (validation.canDeliver) {
      availableDates.push(checkDate.toISOString());
    }
  }
  
  return availableDates;
}

/**
 * Get delivery options with lead time validation
 */
export function getValidatedDeliveryOptions(
  productIds: string[],
  orderTime: Date = new Date(),
  maxWeeks: number = 4
): Array<{
  date: string;
  available: boolean;
  reason?: string;
  productsAvailable: string[];
  productsUnavailable: Array<{ productId: string; reason: string; earliestDelivery?: string }>;
}> {
  const deliveryDates: { [key: string]: {
    date: string;
    available: boolean;
    productsAvailable: string[];
    productsUnavailable: Array<{ productId: string; reason: string; earliestDelivery?: string }>;
  }} = {};
  
  // For bundles, we need to check if ALL components can be delivered by the same date
  // Use the LONGEST lead time among all products in the cart
  const products = getProductsWithInventory();
  const cartProducts = productIds.map(id => 
    products.find(p => p._id === id || p.sku === id)
  ).filter(Boolean);
  
  if (cartProducts.length === 0) {
    return [];
  }
  
  // Find the maximum lead time among all products
  const maxLeadTime = Math.max(...cartProducts.map(p => p.leadTimeDays || 0));
  
  // Check each potential delivery date
  const startDate = new Date(orderTime);
  startDate.setDate(startDate.getDate() + 1);
  
  for (let i = 0; i < maxWeeks * 7; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    // Only check Tuesday, Thursday, Saturday (delivery days)
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek !== 2 && dayOfWeek !== 4 && dayOfWeek !== 5) {
      continue;
    }
    
    const dateStr = checkDate.toISOString();
    const productsAvailable: string[] = [];
    const productsUnavailable: Array<{ productId: string; reason: string; earliestDelivery?: string }> = [];
    
    // Check each product against this delivery date
    for (const productId of productIds) {
      const validation = canDeliverByDate(productId, dateStr, orderTime);
      
      if (validation.canDeliver) {
        productsAvailable.push(productId);
      } else {
        productsUnavailable.push({
          productId,
          reason: validation.reason || "Cannot deliver by this date",
          earliestDelivery: validation.earliestDelivery
        });
      }
    }
    
    // For bundles, ALL products must be available for the same date
    const isAvailable = productsUnavailable.length === 0;
    
    deliveryDates[dateStr] = {
      date: dateStr,
      available: isAvailable,
      productsAvailable,
      productsUnavailable,
      reason: isAvailable ? undefined : `Bundle requires all products ready. ${productsUnavailable.map(p => p.reason).join(', ')}`
    };
  }
  
  // Convert to array and sort by date
  const options = Object.values(deliveryDates);
  options.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return options;
}

/**
 * Validate cart against delivery date
 */
export function validateCartDelivery(
  cart: Array<{ productId: string; qty: number }>,
  deliveryDate: string,
  orderTime: Date = new Date()
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const item of cart) {
    const validation = canDeliverByDate(item.productId, deliveryDate, orderTime);
    
    if (!validation.canDeliver) {
      errors.push(`${item.productId}: ${validation.reason}`);
    } else if (validation.leadTimeDays && validation.leadTimeDays > 10) {
      warnings.push(`${item.productId}: Long lead time (${validation.leadTimeDays} days)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
