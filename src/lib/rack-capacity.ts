/**
 * ChefPax Production Rack Capacity Configuration
 * 
 * Defines physical grow space constraints to prevent overselling
 */

export interface RackConfig {
  name: string;
  totalSlots: number;
  traySize: '10x20' | '5x5';
  description: string;
}

export interface CapacityAllocation {
  rackName: string;
  usedSlots: number;
  availableSlots: number;
  totalSlots: number;
}

/**
 * PRODUCTION RACK LAYOUT (Actual Physical Capacity)
 * 
 * Main Rack: 20 universal slots
 *   - Each slot can hold:
 *     • 1× 10×20 tray OR
 *     • 8× 5×5 trays
 *   - Total: 20 slots (flexible allocation)
 * 
 * Premium Area: 9 dedicated 5×5 positions
 *   - Separate small space for premium herbs/specialty crops
 *   - Total: 9 concurrent 5×5 trays (not using Main Rack slots)
 * 
 * MAXIMUM CAPACITY:
 *   - 10×20 trays: 20 max (all slots used for 10×20)
 *   - 5×5 trays: 169 max (9 premium + 160 from Main Rack [20 slots × 8 per slot])
 *   - Realistic mix: ~15 large + ~49 small trays at any given time
 */
export const RACK_CAPACITY: Record<string, RackConfig> = {
  MAIN_RACK: {
    name: 'Main Production Rack',
    totalSlots: 20,
    traySize: '10x20',
    description: '20 universal slots - each holds 1× 10×20 OR 8× 5×5 trays'
  },
  PREMIUM_AREA: {
    name: 'Premium Small Tray Area',
    totalSlots: 9,
    traySize: '5x5',
    description: '9 dedicated positions for 5×5 premium trays (separate from Main Rack)'
  }
};

/**
 * FLEXIBLE SLOT ALLOCATION
 * 
 * One 10×20 slot can hold:
 * - 1× 10×20 tray OR
 * - 8× 5×5 trays (in a grid)
 */
export const SLOT_CONVERSION = {
  '10x20_to_5x5': 8, // One 10×20 slot = 8× 5×5 trays
  '5x5_to_10x20': 0.125 // Eight 5×5 trays = 1× 10×20 slot
};

/**
 * Calculate which rack to use for a product
 */
export function getRackForProduct(traySize: '10x20' | '5x5'): string {
  // 5×5 trays prefer Premium Area, but can overflow to Main Rack
  if (traySize === '5x5') {
    return 'PREMIUM_AREA';
  }
  return 'MAIN_RACK';
}

/**
 * Calculate how many slots a product needs
 */
export function calculateSlotRequirement(traySize: '10x20' | '5x5', quantity: number): {
  rackName: string;
  slotsNeeded: number;
  canOverflow: boolean;
} {
  if (traySize === '10x20') {
    return {
      rackName: 'MAIN_RACK',
      slotsNeeded: quantity, // 1 tray = 1 slot
      canOverflow: false
    };
  }
  
  // 5×5 trays: Try Premium Area first (1 tray per position)
  return {
    rackName: 'PREMIUM_AREA',
    slotsNeeded: quantity, // 1 position per 5×5 tray in Premium Area
    canOverflow: true // Can overflow to Main Rack (8× 5×5 per slot) if Premium is full
  };
}

/**
 * TOTAL PRODUCTION CAPACITY
 * 
 * Maximum concurrent trays across all racks:
 * - 10×20 trays: 20 slots (Main Rack)
 * - 5×5 trays: 9 slots (Premium) + 8 slots (1 Main slot converted) = 17 total
 * 
 * Note: If Premium is full, 5×5 orders can take slots from Main Rack
 * at 8× 5×5 per 10×20 slot
 */
export const TOTAL_CAPACITY = {
  '10x20': 20,
  '5x5_dedicated': 9,
  '5x5_overflow': 8, // If we use 1 slot from Main Rack
  '5x5_max': 17 // 9 premium + 8 overflow
};

/**
 * Lead time for each tray size (used for reservation windows)
 */
export const LEAD_TIMES = {
  '10x20': 10, // 8-10 days typical
  '5x5': 15 // 12-18 days typical (premium crops take longer)
};

