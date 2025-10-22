/**
 * Inventory Reservation System
 * 
 * Manages inventory reservations and availability tracking
 */

import { getDb } from "./mongo";
import type { Order, Product } from "./schema";
import { getProductsWithInventory } from "./inventory";

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  errors: string[];
}

export interface InventoryStatus {
  productId: string;
  totalCapacity: number;
  reserved: number;
  available: number;
  overbooked: boolean;
}

/**
 * Create inventory reservation for an order
 */
export async function createReservation(order: Order): Promise<ReservationResult> {
  const result: ReservationResult = {
    success: false,
    errors: []
  };

  try {
    const db = await getDb();
    const products = getProductsWithInventory();
    
    // Check if we have enough inventory for each item
    for (const item of order.items) {
      const product = products.find(p => p._id === item.productId || p.sku === item.productId);
      if (!product) {
        result.errors.push(`Product not found: ${item.productId}`);
        continue;
      }

      // Check availability
      const availability = await checkProductAvailability(product._id, item.qty, order.deliveryDate);
      if (!availability.available) {
        result.errors.push(`Insufficient inventory for ${product.name}: requested ${item.qty}, available ${availability.available}`);
      }
    }

    if (result.errors.length > 0) {
      return result;
    }

    // Create reservation
    const reservation = {
      orderId: order._id?.toString() || '',
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.qty,
        reservedAt: new Date().toISOString()
      })),
      deliveryDate: order.deliveryDate,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const insertResult = await db.collection("inventoryReservations").insertOne(reservation);
    result.reservationId = insertResult.insertedId.toString();
    result.success = true;

    return result;

  } catch (error) {
    console.error("Error creating inventory reservation:", error);
    result.errors.push(`Failed to create reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Check product availability for a specific date
 */
export async function checkProductAvailability(productId: string, quantity: number, deliveryDate: string): Promise<{ available: number; reserved: number; total: number }> {
  try {
    const db = await getDb();
    const products = getProductsWithInventory();
    const product = products.find(p => p._id === productId || p.sku === productId);
    
    if (!product) {
      return { available: 0, reserved: 0, total: 0 };
    }

    // Get total capacity for this product
    const totalCapacity = product.weeklyCapacity || 0;

    // Get existing reservations for this delivery date
    const reservations = await db.collection("inventoryReservations").find({
      deliveryDate,
      status: 'active',
      'items.productId': productId
    }).toArray();

    // Calculate reserved quantity
    let reserved = 0;
    reservations.forEach(reservation => {
      reservation.items.forEach((item: any) => {
        if (item.productId === productId) {
          reserved += item.quantity;
        }
      });
    });

    const available = Math.max(0, totalCapacity - reserved);

    return {
      available,
      reserved,
      total: totalCapacity
    };

  } catch (error) {
    console.error("Error checking product availability:", error);
    return { available: 0, reserved: 0, total: 0 };
  }
}

/**
 * Release inventory reservation
 */
export async function releaseReservation(reservationId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const result = await db.collection("inventoryReservations").updateOne(
      { _id: reservationId },
      { 
        $set: { 
          status: 'released',
          releasedAt: new Date().toISOString()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error releasing reservation:", error);
    return false;
  }
}

/**
 * Get inventory status for all products
 */
export async function getInventoryStatus(deliveryDate: string): Promise<InventoryStatus[]> {
  try {
    const db = await getDb();
    const products = getProductsWithInventory();
    const statuses: InventoryStatus[] = [];

    for (const product of products) {
      const availability = await checkProductAvailability(product._id, 0, deliveryDate);
      
      statuses.push({
        productId: product._id,
        totalCapacity: availability.total,
        reserved: availability.reserved,
        available: availability.available,
        overbooked: availability.available < 0
      });
    }

    return statuses;
  } catch (error) {
    console.error("Error getting inventory status:", error);
    return [];
  }
}

/**
 * Clean up expired reservations
 */
export async function cleanupExpiredReservations(): Promise<number> {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.collection("inventoryReservations").updateMany(
      {
        status: 'active',
        expiresAt: { $lt: now }
      },
      {
        $set: {
          status: 'expired',
          expiredAt: now
        }
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
    return 0;
  }
}

/**
 * Check if a specific quantity of trays is available for a delivery date
 * @param traySize The size of trays needed ('10x20' or '5x5')
 * @param quantity Number of trays needed
 * @param deliveryDate The requested delivery date
 * @returns Availability status and details
 */
export async function checkAvailability(
  traySize: '10x20' | '5x5',
  quantity: number,
  deliveryDate: Date
): Promise<{
  available: boolean;
  availableQuantity: number;
  totalCapacity: number;
  reservedQuantity: number;
  reason?: string;
}> {
  const db = await getDb();
  
  try {
    // Get total capacity for this tray size
    const totalCapacity = traySize === '10x20' ? 20 : 10; // Example capacity
    
    // Get current reservations for this delivery date and tray size
    const reservations = await db.collection<InventoryReservation>("inventoryReservations").find({
      deliveryDate: deliveryDate.toISOString(),
      traySize,
      status: { $in: ["RESERVED", "CONFIRMED"] }
    }).toArray();
    
    const reservedQuantity = reservations.reduce((sum, res) => sum + res.quantity, 0);
    const availableQuantity = Math.max(0, totalCapacity - reservedQuantity);
    
    return {
      available: availableQuantity >= quantity,
      availableQuantity,
      totalCapacity,
      reservedQuantity,
      reason: availableQuantity < quantity ? `Only ${availableQuantity} trays available, need ${quantity}` : undefined
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      available: false,
      availableQuantity: 0,
      totalCapacity: 0,
      reservedQuantity: 0,
      reason: "Error checking availability"
    };
  }
}

/**
 * Get rack utilization statistics
 * @returns Rack utilization data
 */
export async function getRackUtilization(): Promise<{
  totalRacks: number;
  utilizedRacks: number;
  availableRacks: number;
  utilizationRate: number;
  rackDetails: Array<{
    rackName: string;
    status: 'available' | 'reserved' | 'in_use';
    capacity: number;
    used: number;
  }>;
}> {
  const db = await getDb();
  
  try {
    // Get all reservations
    const reservations = await db.collection<InventoryReservation>("inventoryReservations").find({
      status: { $in: ["RESERVED", "CONFIRMED"] }
    }).toArray();
    
    // Group by rack
    const rackMap = new Map<string, { capacity: number; used: number }>();
    
    reservations.forEach(res => {
      const rackName = res.rackName;
      if (!rackMap.has(rackName)) {
        rackMap.set(rackName, { capacity: 20, used: 0 }); // Default capacity
      }
      const rack = rackMap.get(rackName)!;
      rack.used += res.quantity;
    });
    
    const rackDetails = Array.from(rackMap.entries()).map(([rackName, data]) => ({
      rackName,
      status: data.used > 0 ? (data.used >= data.capacity ? 'in_use' : 'reserved') : 'available' as const,
      capacity: data.capacity,
      used: data.used
    }));
    
    const totalRacks = rackDetails.length;
    const utilizedRacks = rackDetails.filter(r => r.used > 0).length;
    const availableRacks = totalRacks - utilizedRacks;
    const utilizationRate = totalRacks > 0 ? (utilizedRacks / totalRacks) * 100 : 0;
    
    return {
      totalRacks,
      utilizedRacks,
      availableRacks,
      utilizationRate,
      rackDetails
    };
  } catch (error) {
    console.error("Error getting rack utilization:", error);
    return {
      totalRacks: 0,
      utilizedRacks: 0,
      availableRacks: 0,
      utilizationRate: 0,
      rackDetails: []
    };
  }
}