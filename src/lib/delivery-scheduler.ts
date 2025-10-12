/**
 * ChefPax Delivery Date Scheduling
 * 
 * Calculates valid delivery dates based on:
 * - Product lead times (grow cycles)
 * - Delivery schedule (Tue, Thu, Sat)
 * - Inventory availability
 */

export interface DeliveryDateOption {
  date: Date;
  dayOfWeek: string;
  formattedDate: string;
  available: boolean;
  reason?: string;
  daysUntilDelivery: number;
}

/**
 * ChefPax delivery days: Tuesday, Thursday, Saturday
 */
const DELIVERY_DAYS_OF_WEEK = [2, 4, 6]; // 0=Sun, 1=Mon, 2=Tue, 4=Thu, 6=Sat

/**
 * Calculate the longest lead time from cart items
 */
export function calculateRequiredLeadTime(cartItems: Array<{ leadTimeDays?: number; sizeOz?: number }>): number {
  let maxLeadTime = 10; // Default minimum lead time
  
  for (const item of cartItems) {
    const itemLeadTime = item.leadTimeDays || (item.sizeOz && item.sizeOz < 50 ? 15 : 10);
    if (itemLeadTime > maxLeadTime) {
      maxLeadTime = itemLeadTime;
    }
  }
  
  return maxLeadTime;
}

/**
 * Group cart items by lead time for multi-delivery suggestions
 */
export function groupItemsByLeadTime(cartItems: Array<{ 
  name: string; 
  leadTimeDays?: number; 
  sizeOz?: number;
  qty: number;
}>): Array<{
  leadTimeDays: number;
  items: typeof cartItems;
  earliestDeliveryDate: Date;
}> {
  const groups = new Map<number, typeof cartItems>();
  
  // Group items by lead time
  for (const item of cartItems) {
    const itemLeadTime = item.leadTimeDays || (item.sizeOz && item.sizeOz < 50 ? 15 : 10);
    
    if (!groups.has(itemLeadTime)) {
      groups.set(itemLeadTime, []);
    }
    groups.get(itemLeadTime)!.push(item);
  }
  
  // Convert to array and calculate earliest delivery for each group
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return Array.from(groups.entries())
    .map(([leadTime, items]) => ({
      leadTimeDays: leadTime,
      items,
      earliestDeliveryDate: getNextAvailableDeliveryDate(leadTime)
    }))
    .sort((a, b) => a.leadTimeDays - b.leadTimeDays); // Shortest lead time first
}

/**
 * Check if cart has mixed lead times (suggests multi-delivery)
 */
export function hasMixedLeadTimes(cartItems: Array<{ leadTimeDays?: number; sizeOz?: number }>): {
  hasMixed: boolean;
  daysDifference: number;
  suggestSplit: boolean;
} {
  const leadTimes = cartItems.map(item => 
    item.leadTimeDays || (item.sizeOz && item.sizeOz < 50 ? 15 : 10)
  );
  
  const minLeadTime = Math.min(...leadTimes);
  const maxLeadTime = Math.max(...leadTimes);
  const difference = maxLeadTime - minLeadTime;
  
  return {
    hasMixed: difference > 0,
    daysDifference: difference,
    suggestSplit: difference >= 5 // Suggest split if 5+ days difference
  };
}

/**
 * Get next available delivery dates based on lead time
 * 
 * @param requiredLeadTimeDays - Minimum days needed to grow the products
 * @param maxDatesAhead - How many delivery dates to show (default 10)
 */
export function getAvailableDeliveryDates(
  requiredLeadTimeDays: number,
  maxDatesAhead: number = 10
): DeliveryDateOption[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const earliestPossibleDate = new Date(today);
  earliestPossibleDate.setDate(earliestPossibleDate.getDate() + requiredLeadTimeDays);
  
  const deliveryDates: DeliveryDateOption[] = [];
  let currentDate = new Date(today);
  
  // Look ahead up to 30 days
  while (deliveryDates.length < maxDatesAhead && currentDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Check if this is a delivery day
    if (DELIVERY_DAYS_OF_WEEK.includes(currentDate.getDay())) {
      const daysUntilDelivery = Math.floor((currentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const available = daysUntilDelivery >= requiredLeadTimeDays;
      
      deliveryDates.push({
        date: new Date(currentDate),
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        formattedDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: currentDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
        }),
        available,
        reason: available ? undefined : `Needs ${requiredLeadTimeDays} days to grow (${requiredLeadTimeDays - daysUntilDelivery} days too soon)`,
        daysUntilDelivery
      });
    }
  }
  
  return deliveryDates;
}

/**
 * Get the next available delivery date (earliest possible)
 */
export function getNextAvailableDeliveryDate(requiredLeadTimeDays: number): Date {
  const dates = getAvailableDeliveryDates(requiredLeadTimeDays, 10);
  const available = dates.find(d => d.available);
  return available?.date || new Date(); // Fallback to today if something goes wrong
}

/**
 * Format delivery date for display
 */
export function formatDeliveryDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deliveryDate = new Date(date);
  deliveryDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `This ${deliveryDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
  
  return deliveryDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Validate if a delivery date is acceptable for given cart items
 */
export function validateDeliveryDate(
  deliveryDate: Date,
  cartItems: Array<{ name: string; leadTimeDays?: number; sizeOz?: number }>
): { valid: boolean; reason?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  
  const daysUntilDelivery = Math.floor((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if it's a valid delivery day
  if (!DELIVERY_DAYS_OF_WEEK.includes(delivery.getDay())) {
    return {
      valid: false,
      reason: 'We only deliver on Tuesdays, Thursdays, and Saturdays'
    };
  }
  
  // Check if any item needs more time
  for (const item of cartItems) {
    const itemLeadTime = item.leadTimeDays || (item.sizeOz && item.sizeOz < 50 ? 15 : 10);
    
    if (daysUntilDelivery < itemLeadTime) {
      return {
        valid: false,
        reason: `${item.name} needs ${itemLeadTime} days to grow (delivery in ${daysUntilDelivery} days is too soon)`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Get delivery time window
 */
export function getDeliveryWindow(date: Date): string {
  const dayOfWeek = date.getDay();
  
  // Default delivery windows (can be customized)
  switch (dayOfWeek) {
    case 2: // Tuesday
      return '2 PM - 6 PM';
    case 4: // Thursday
      return '2 PM - 6 PM';
    case 6: // Saturday
      return '10 AM - 2 PM';
    default:
      return '2 PM - 6 PM';
  }
}

