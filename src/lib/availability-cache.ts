import { checkAvailability } from './inventory-reservation';

interface CachedAvailability {
  availableSlots: number;
  rackName: string;
  lastUpdated: number;
}

// In-memory cache with 5-minute TTL
const cache = new Map<string, CachedAvailability>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedAvailability(
  productId: string,
  traySize: '10x20' | '5x5',
  deliveryDate: Date
): Promise<{ availableSlots: number; rackName: string }> {
  const cacheKey = `${productId}-${traySize}-${deliveryDate.toISOString().split('T')[0]}`;
  const now = Date.now();
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.lastUpdated) < CACHE_TTL) {
    return {
      availableSlots: cached.availableSlots,
      rackName: cached.rackName
    };
  }
  
  // Calculate availability
  try {
    const availability = await checkAvailability(traySize, 1, deliveryDate);
    
    // Update cache
    cache.set(cacheKey, {
      availableSlots: availability.availableSlots,
      rackName: availability.rackName,
      lastUpdated: now
    });
    
    return availability;
  } catch (error) {
    console.error(`Error checking availability for ${productId}:`, error);
    // Return default values on error
    return {
      availableSlots: 0,
      rackName: 'MAIN_RACK'
    };
  }
}

// Batch calculation for multiple products (faster than sequential)
export async function batchCalculateAvailability(
  products: Array<{ _id: string; sizeOz?: number; weeklyCapacity?: number }>,
  deliveryDate: Date
): Promise<Map<string, { availableSlots: number; rackName: string }>> {
  const results = new Map();
  
  // Process all products in parallel (not sequential!)
  await Promise.all(
    products.map(async (product) => {
      try {
        const traySize = (product.sizeOz && product.sizeOz < 50) ? '5x5' : '10x20';
        const availability = await getCachedAvailability(product._id, traySize as '10x20' | '5x5', deliveryDate);
        results.set(product._id, availability);
      } catch (error) {
        console.error(`Error for ${product._id}:`, error);
        results.set(product._id, { 
          availableSlots: product.weeklyCapacity || 0, 
          rackName: 'MAIN_RACK' 
        });
      }
    })
  );
  
  return results;
}

// Clear cache (useful for testing or manual refresh)
export function clearAvailabilityCache() {
  cache.clear();
}
