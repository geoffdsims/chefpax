/**
 * Enhanced Automation Schemas for ChefPax
 * Implements the full automation framework for subscription-based microgreen delivery
 */

export type ProductionTask = {
  _id?: string;
  orderId?: string;           // If from one-time order
  subscriptionId?: string;    // If from subscription
  productId: string;
  type: "SEED" | "GERMINATE" | "LIGHT" | "HARVEST" | "PACK";
  runAt: string;             // ISO date when task should execute
  status: "PENDING" | "READY" | "IN_PROGRESS" | "DONE" | "FAILED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes?: string;
  quantity: number;          // Number of trays/units
  labels?: TaskLabel[];      // Labels to print
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type TaskLabel = {
  template: "tray" | "packaging" | "delivery";
  payload: {
    sku: string;
    batch: string;
    orderId?: string;
    customerName?: string;
    deliveryDate?: string;
  };
};

export type DeliveryJob = {
  _id?: string;
  orderId: string;
  method: "LOCAL_COURIER" | "SHIPPING" | "PICKUP";
  provider?: "uber_direct" | "roadie" | "shippo" | "easypost";
  status: "REQUESTED" | "SCHEDULED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  trackingUrl?: string;
  trackingNumber?: string;
  eta?: string;
  scheduledFor?: string;
  address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
  };
  instructions?: string;
  webhookHistory: DeliveryWebhook[];
  createdAt: string;
  updatedAt: string;
};

export type DeliveryWebhook = {
  timestamp: string;
  status: string;
  message: string;
  providerData?: Record<string, any>;
};

export type EnhancedProduct = {
  _id?: string;
  sku: string;
  name: string;
  priceCents: number;
  unit: "clamshell" | "tray";
  active: boolean;
  sort: number;
  photoUrl?: string;
  category: "mix" | "single" | "live_tray";
  variety?: "pea" | "sunflower" | "radish" | "amaranth" | "mixed";
  sizeOz?: number;
  weeklyCapacity?: number;
  currentWeekAvailable?: number;
  
  // Automation-specific fields
  leadTimeDays: number;        // Days from seed to harvest
  isSubscriptionEligible: boolean;
  stages: ProductStage[];      // Grow cycle stages
  
  // Stripe integration
  stripe?: {
    priceId: string;
    productId: string;
  };
  
  // Subscription settings
  subscriptionEnabled: boolean;
  subscriptionPriceCents?: number;
  stripeSubscriptionPriceId?: string;
  subscriptionDiscount?: number;
};

export type ProductStage = {
  type: "SEED" | "GERMINATE" | "LIGHT" | "HARVEST" | "PACK";
  offsetDays: number;         // Days from order date
  durationDays?: number;      // How long this stage lasts
  requirements?: string[];    // Equipment, conditions needed
  notes?: string;
};

export type EnhancedSubscription = {
  _id?: string;
  customerId: string;         // Stripe customer ID
  userId?: string;            // NextAuth user ID
  status: "active" | "paused" | "cancelled";
  
  // Stripe integration
  stripe?: {
    subscriptionId: string;
    priceId: string;
    customerId: string;
  };
  
  // Subscription details
  items: SubscriptionItem[];
  frequency: "weekly" | "biweekly" | "monthly";
  deliveryDayOfWeek: number;  // 0-6 (Sunday-Saturday)
  nextCycleAt: string;        // Next delivery date
  
  // Delivery preferences
  address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
  };
  
  // Automation
  autoRenew: boolean;
  pauseUntil?: string;
  
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionItem = {
  productId: string;
  quantity: number;
  frequency: "weekly" | "biweekly" | "monthly";
  deliveryDayOfWeek?: number;
};

export type AutomationJob = {
  _id?: string;
  type: "production" | "delivery" | "notification" | "subscription_cycle";
  status: "pending" | "processing" | "completed" | "failed";
  payload: Record<string, any>;
  scheduledFor: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
  result?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type InventoryAlert = {
  _id?: string;
  type: "low_stock" | "reorder_needed" | "overstock";
  productId?: string;
  item: string;              // "amaranth_seeds", "trays", "hemp_mats"
  currentQuantity: number;
  threshold: number;
  status: "active" | "resolved";
  message: string;
  createdAt: string;
  resolvedAt?: string;
};

export type MarketingCampaign = {
  _id?: string;
  name: string;
  type: "welcome" | "abandoned_cart" | "refill_reminder" | "seasonal" | "referral";
  status: "active" | "paused" | "completed";
  trigger: {
    event: string;           // "order_completed", "cart_abandoned", "subscription_due"
    delay?: number;          // Hours to wait before sending
  };
  template: {
    subject: string;
    htmlContent: string;
    smsContent?: string;
  };
  audience: {
    segment: "all" | "new_customers" | "subscription_customers" | "lapsed_customers";
    filters?: Record<string, any>;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type BusinessMetrics = {
  _id?: string;
  date: string;
  period: "daily" | "weekly" | "monthly";
  
  // Revenue metrics
  mrr: number;               // Monthly Recurring Revenue
  arr: number;               // Annual Recurring Revenue
  totalRevenue: number;
  
  // Subscription metrics
  activeSubscriptions: number;
  newSubscriptions: number;
  churnRate: number;
  
  // Production metrics
  traysSeeded: number;
  traysHarvested: number;
  traysDelivered: number;
  
  // Delivery metrics
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  
  // Customer metrics
  newCustomers: number;
  returningCustomers: number;
  customerSatisfactionScore?: number;
  
  createdAt: string;
};
