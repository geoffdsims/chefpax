/**
 * ChefPax Analytics Tracking
 * Custom event tracking for "Produce as a Service" real-time marketing
 */

import { track } from '@vercel/analytics';

export type GrowRoomEvent = {
  tray_id: string;
  variety: string;
  day: number;
  temperature?: number;
  humidity?: number;
  light_lux?: number;
  growth_stage?: string;
  yield_prediction?: number;
};

export type PremiumPricingEvent = {
  product: string;
  price_cents: number;
  competitor_price_cents?: number;
  premium_percentage?: number;
  accepted: boolean;
};

export type SubscriptionEvent = {
  type: 'started' | 'paused' | 'resumed' | 'cancelled';
  plan: string;
  frequency: string;
  discount_percentage?: number;
};

export type CartEvent = {
  action: 'add' | 'remove' | 'view' | 'abandon';
  product: string;
  quantity: number;
  price_cents: number;
};

export type CheckoutEvent = {
  step: 'initiated' | 'payment' | 'completed' | 'failed';
  total_cents: number;
  item_count: number;
  payment_method?: string;
};

/**
 * Track grow room engagement for real-time marketing
 */
export function trackGrowRoomView(data: GrowRoomEvent) {
  const payload: Record<string, string | number> = {
    tray_id: data.tray_id,
    variety: data.variety,
    day: data.day,
  };
  
  if (data.temperature !== undefined) payload.temperature = data.temperature;
  if (data.humidity !== undefined) payload.humidity = data.humidity;
  if (data.light_lux !== undefined) payload.light_lux = data.light_lux;
  if (data.growth_stage !== undefined) payload.growth_stage = data.growth_stage;
  if (data.yield_prediction !== undefined) payload.yield_prediction = data.yield_prediction;
  
  track('grow_room_viewed', payload);
}

/**
 * Track premium pricing acceptance/rejection
 */
export function trackPremiumPricing(data: PremiumPricingEvent) {
  const payload: Record<string, string | number | boolean> = {
    product: data.product,
    price_cents: data.price_cents,
    accepted: data.accepted,
  };
  
  if (data.competitor_price_cents !== undefined) payload.competitor_price_cents = data.competitor_price_cents;
  if (data.premium_percentage !== undefined) payload.premium_percentage = data.premium_percentage;
  
  track('premium_pricing', payload);
}

/**
 * Track subscription lifecycle events
 */
export function trackSubscription(data: SubscriptionEvent) {
  const payload: Record<string, string | number> = {
    plan: data.plan,
    frequency: data.frequency,
  };
  
  if (data.discount_percentage !== undefined) payload.discount_percentage = data.discount_percentage;
  
  track(`subscription_${data.type}`, payload);
}

/**
 * Track cart interactions
 */
export function trackCart(data: CartEvent) {
  track(`cart_${data.action}`, {
    product: data.product,
    quantity: data.quantity,
    price_cents: data.price_cents,
  });
}

/**
 * Track checkout funnel
 */
export function trackCheckout(data: CheckoutEvent) {
  const payload: Record<string, string | number> = {
    total_cents: data.total_cents,
    item_count: data.item_count,
  };
  
  if (data.payment_method !== undefined) payload.payment_method = data.payment_method;
  
  track(`checkout_${data.step}`, payload);
}

/**
 * Track delivery events
 */
export function trackDelivery(event: 'scheduled' | 'out_for_delivery' | 'delivered' | 'failed', orderId: string) {
  track(`delivery_${event}`, {
    order_id: orderId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track real-time transparency features (key differentiator)
 */
export function trackTransparency(feature: 'camera_feed' | 'sensor_data' | 'growth_timeline' | 'quality_metrics', data?: Record<string, any>) {
  track(`transparency_${feature}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track customer engagement with educational content
 */
export function trackEducation(content: 'recipe' | 'growing_tips' | 'nutrition_info' | 'behind_science', productVariety?: string) {
  const payload: Record<string, string> = {
    content_type: content,
  };
  
  if (productVariety !== undefined) payload.product_variety = productVariety;
  
  track('education_viewed', payload);
}

/**
 * Track IoT sensor data engagement (future feature)
 */
export function trackIoTEngagement(sensor: 'temperature' | 'humidity' | 'light' | 'co2' | 'ph', data?: Record<string, any>) {
  track('iot_sensor_viewed', {
    sensor_type: sensor,
    ...data,
  });
}

