/**
 * ChefPax Inventory Reservation System
 * 
 * Prevents overselling by reserving rack space when orders are placed
 */

import { getDb } from './mongo';
import { RACK_CAPACITY, calculateSlotRequirement, TOTAL_CAPACITY } from './rack-capacity';
import type { ObjectId } from 'mongodb';

export interface InventoryReservation {
  _id?: ObjectId;
  orderId: string;
  productId: string;
  productName: string;
  traySize: '10x20' | '5x5';
  quantity: number;
  rackName: string;
  slotsReserved: number;
  deliveryDate: Date;
  sowDate: Date;
  harvestDate: Date;
  status: 'reserved' | 'in_progress' | 'fulfilled' | 'cancelled';
  productionTaskIds: string[];
  createdAt: Date;
  fulfilledAt?: Date;
}

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
  availableSlots: number;
  requestedSlots: number;
  rackName: string;
}

/**
 * Check if rack space is available for a given delivery date
 */
export async function checkAvailability(
  traySize: '10x20' | '5x5',
  quantity: number,
  deliveryDate: Date
): Promise<AvailabilityCheck> {
  const db = await getDb();
  
  const { rackName, slotsNeeded, canOverflow } = calculateSlotRequirement(traySize, quantity);
  const rack = RACK_CAPACITY[rackName];
  
  // Calculate the grow window (deliveryDate - leadTime to deliveryDate)
  const leadTime = traySize === '10x20' ? 10 : 15; // days
  const sowDate = new Date(deliveryDate);
  sowDate.setDate(sowDate.getDate() - leadTime);
  
  // Find all reservations that overlap with this grow window
  const overlappingReservations = await db.collection<InventoryReservation>('inventoryReservations')
    .find({
      rackName,
      status: { $in: ['reserved', 'in_progress'] },
      // Overlaps if: their sowDate ≤ our deliveryDate AND their deliveryDate ≥ our sowDate
      sowDate: { $lte: deliveryDate },
      deliveryDate: { $gte: sowDate }
    })
    .toArray();
  
  // Calculate occupied slots
  const occupiedSlots = overlappingReservations.reduce(
    (total, res) => total + res.slotsReserved,
    0
  );
  
  const availableSlots = rack.totalSlots - occupiedSlots;
  
  // Check primary rack
  if (availableSlots >= slotsNeeded) {
    return {
      available: true,
      availableSlots,
      requestedSlots: slotsNeeded,
      rackName
    };
  }
  
  // If 5×5 and can overflow to Main Rack, check there
  if (canOverflow && rackName === 'PREMIUM_AREA') {
    const mainRackCheck = await checkMainRackOverflow(quantity, sowDate, deliveryDate);
    if (mainRackCheck.available) {
      return mainRackCheck;
    }
  }
  
  return {
    available: false,
    reason: `Insufficient capacity on ${rack.name}. Need ${slotsNeeded} slots, only ${availableSlots} available.`,
    availableSlots,
    requestedSlots: slotsNeeded,
    rackName
  };
}

/**
 * Check if Main Rack can accommodate 5×5 overflow
 * (8× 5×5 trays fit in one 10×20 slot)
 */
async function checkMainRackOverflow(
  quantity: number,
  sowDate: Date,
  deliveryDate: Date
): Promise<AvailabilityCheck> {
  const db = await getDb();
  const mainRack = RACK_CAPACITY.MAIN_RACK;
  
  // Calculate slots needed (8× 5×5 per 10×20 slot)
  const slotsNeeded = Math.ceil(quantity / 8);
  
  // Find overlapping reservations on Main Rack
  const overlappingReservations = await db.collection<InventoryReservation>('inventoryReservations')
    .find({
      rackName: 'MAIN_RACK',
      status: { $in: ['reserved', 'in_progress'] },
      sowDate: { $lte: deliveryDate },
      deliveryDate: { $gte: sowDate }
    })
    .toArray();
  
  const occupiedSlots = overlappingReservations.reduce(
    (total, res) => total + res.slotsReserved,
    0
  );
  
  const availableSlots = mainRack.totalSlots - occupiedSlots;
  
  if (availableSlots >= slotsNeeded) {
    return {
      available: true,
      availableSlots,
      requestedSlots: slotsNeeded,
      rackName: 'MAIN_RACK'
    };
  }
  
  return {
    available: false,
    reason: `Premium rack full, Main rack overflow also full. Need ${slotsNeeded} slots, only ${availableSlots} available.`,
    availableSlots,
    requestedSlots: slotsNeeded,
    rackName: 'MAIN_RACK'
  };
}

/**
 * Reserve rack space for an order
 */
export async function createReservation(
  orderId: string,
  productId: string,
  productName: string,
  traySize: '10x20' | '5x5',
  quantity: number,
  deliveryDate: Date,
  productionTaskIds: string[]
): Promise<{ success: boolean; reservation?: InventoryReservation; error?: string }> {
  const db = await getDb();
  
  // Check availability first
  const availability = await checkAvailability(traySize, quantity, deliveryDate);
  
  if (!availability.available) {
    return {
      success: false,
      error: availability.reason
    };
  }
  
  // Calculate dates
  const leadTime = traySize === '10x20' ? 10 : 15;
  const sowDate = new Date(deliveryDate);
  sowDate.setDate(sowDate.getDate() - leadTime);
  
  const harvestDate = new Date(deliveryDate);
  harvestDate.setDate(harvestDate.getDate() - 1); // Harvest 1 day before delivery
  
  // Create reservation
  const reservation: InventoryReservation = {
    orderId,
    productId,
    productName,
    traySize,
    quantity,
    rackName: availability.rackName,
    slotsReserved: availability.requestedSlots,
    deliveryDate,
    sowDate,
    harvestDate,
    status: 'reserved',
    productionTaskIds,
    createdAt: new Date()
  };
  
  const result = await db.collection<InventoryReservation>('inventoryReservations').insertOne(reservation);
  
  return {
    success: true,
    reservation: { ...reservation, _id: result.insertedId }
  };
}

/**
 * Update reservation status (e.g., when production starts or completes)
 */
export async function updateReservationStatus(
  orderId: string,
  status: 'in_progress' | 'fulfilled' | 'cancelled'
): Promise<boolean> {
  const db = await getDb();
  
  const update: any = { status };
  if (status === 'fulfilled') {
    update.fulfilledAt = new Date();
  }
  
  const result = await db.collection<InventoryReservation>('inventoryReservations').updateOne(
    { orderId },
    { $set: update }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Get current rack utilization (for admin dashboard)
 */
export async function getRackUtilization(startDate?: Date, endDate?: Date): Promise<{
  mainRack: { used: number; available: number; total: number; utilizationPercent: number };
  premiumRack: { used: number; available: number; total: number; utilizationPercent: number };
}> {
  const db = await getDb();
  
  const dateFilter: any = { status: { $in: ['reserved', 'in_progress'] } };
  if (startDate && endDate) {
    dateFilter.sowDate = { $lte: endDate };
    dateFilter.deliveryDate = { $gte: startDate };
  }
  
  // Main Rack utilization
  const mainReservations = await db.collection<InventoryReservation>('inventoryReservations')
    .find({ ...dateFilter, rackName: 'MAIN_RACK' })
    .toArray();
  
  const mainUsed = mainReservations.reduce((total, res) => total + res.slotsReserved, 0);
  const mainTotal = RACK_CAPACITY.MAIN_RACK.totalSlots;
  const mainAvailable = mainTotal - mainUsed;
  
  // Premium Area utilization
  const premiumReservations = await db.collection<InventoryReservation>('inventoryReservations')
    .find({ ...dateFilter, rackName: 'PREMIUM_AREA' })
    .toArray();
  
  const premiumUsed = premiumReservations.reduce((total, res) => total + res.slotsReserved, 0);
  const premiumTotal = RACK_CAPACITY.PREMIUM_AREA.totalSlots;
  const premiumAvailable = premiumTotal - premiumUsed;
  
  return {
    mainRack: {
      used: mainUsed,
      available: mainAvailable,
      total: mainTotal,
      utilizationPercent: Math.round((mainUsed / mainTotal) * 100)
    },
    premiumRack: {
      used: premiumUsed,
      available: premiumAvailable,
      total: premiumTotal,
      utilizationPercent: Math.round((premiumUsed / premiumTotal) * 100)
    }
  };
}

/**
 * Get availability forecast for next N delivery dates
 */
export async function getAvailabilityForecast(
  productId: string,
  traySize: '10x20' | '5x5',
  daysAhead: number = 14
): Promise<Array<{
  date: Date;
  available: number;
  status: 'in_stock' | 'low_stock' | 'sold_out';
}>> {
  const forecast: Array<{ date: Date; available: number; status: 'in_stock' | 'low_stock' | 'sold_out' }> = [];
  
  // Assume delivery dates: Tue, Thu, Sat
  const deliveryDaysOfWeek = [2, 4, 6]; // 0=Sun, 2=Tue, 4=Thu, 6=Sat
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDate = new Date(today);
  
  while (forecast.length < 10 && (currentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < daysAhead) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Check if this is a delivery day
    if (deliveryDaysOfWeek.includes(currentDate.getDay())) {
      const availability = await checkAvailability(traySize, 1, new Date(currentDate));
      
      const status = 
        availability.availableSlots === 0 ? 'sold_out' :
        availability.availableSlots <= 3 ? 'low_stock' : 'in_stock';
      
      forecast.push({
        date: new Date(currentDate),
        available: availability.availableSlots,
        status
      });
    }
  }
  
  return forecast;
}

