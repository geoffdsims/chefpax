export type Product = {
  _id?: string;
  sku: string;                  // e.g. "SUNFLOWER_2OZ"
  name: string;                 // "Sunflower Microgreens – 2 oz"
  priceCents: number;           // 500
  unit: "clamshell" | "tray";
  active: boolean;
  sort: number;
  photoUrl?: string;
  category: "mix" | "single" | "live_tray";
  variety?: "pea" | "sunflower" | "radish" | "amaranth" | "mixed";
  sizeOz?: number;              // 2, 4, or 10x20 for trays
  weeklyCapacity?: number;      // Max units available per week
  currentWeekAvailable?: number; // Available this week (calculated)
  // Subscription settings
  subscriptionEnabled: boolean; // Whether this product can be subscribed to
  subscriptionPriceCents?: number; // Special subscription price (if different from regular price)
  stripeSubscriptionPriceId?: string; // Stripe Price ID for subscriptions
  subscriptionDiscount?: number; // Percentage discount for subscriptions (10 = 10% off)
};

export type WeeklyProduction = {
  week: string;                 // "2024-W01"
  pods: {
    pea: number;               // 12 pods
    sunflower: number;         // 12 pods  
    radish: number;            // 6 pods
  };
  flats: {
    pea: number;               // 4 trays
    sunflower: number;         // 3 trays
    radish: number;            // 6 trays
    amaranth: number;          // 1 tray
  };
  liveTrayReservations: {
    pea: number;               // 1 tray reserved for live
    radish: number;            // 2 trays reserved for live
  };
};

export type OrderItem = {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
};

export type Order = {
  _id?: string;
  status: "paid" | "processing" | "growing" | "ready" | "out_for_delivery" | "delivered" | "refunded";
  customerName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  deliveryDate: string;       // ISO date
  deliveryWindow?: string;    // "9–1"
  createdAt: string;          // ISO
  stripeSessionId: string;
  items: OrderItem[];
  deliveryFeeCents: number;
  subtotalCents: number;
  totalCents: number;
  userId?: string;            // NextAuth user ID
  orderType: "one_time" | "subscription";
  subscriptionId?: string;    // If part of subscription
  // Enhanced tracking fields
  lifecycle: OrderLifecycle;
  trackingNumber?: string;    // For delivery tracking
  estimatedDeliveryTime?: string; // "10:30 AM - 12:30 PM"
  deliveryInstructions?: string;
  specialNotes?: string;
};

// Detailed order lifecycle tracking
export type OrderLifecycle = {
  stages: OrderStage[];
  currentStage: string;
  startDate: string;          // When order processing began
  estimatedCompletion: string; // When order will be delivered
  lastUpdated: string;
};

export type OrderStage = {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed";
  startDate?: string;
  endDate?: string;
  estimatedDuration: number;  // in hours
  icon: string;              // Icon for UI
  color: string;             // Color theme
  details?: string;          // Additional details
};

// Microgreen-specific growth stages
export type MicrogreenStage = {
  productId: string;
  productName: string;
  currentStage: "seeded" | "sprouting" | "growing" | "ready" | "harvested" | "delivered";
  stageProgress: number;     // 0-100%
  daysFromSeeding: number;
  expectedHarvestDate: string;
  growthNotes?: string;
  photos?: string[];         // Progress photos
};

export type Subscription = {
  _id?: string;
  userId: string;
  status: "active" | "paused" | "cancelled";
  frequency: "weekly" | "biweekly" | "monthly";
  deliveryDay: number;        // 0-6 (Sunday-Saturday)
  nextDeliveryDate: string;   // ISO date
  items: OrderItem[];
  deliveryFeeCents: number;
  createdAt: string;
  updatedAt: string;
  stripeSubscriptionId?: string;
  autoRenew: boolean;
};

export type DeliveryOption = {
  date: string;               // ISO date
  available: boolean;
  cutoffTime: string;         // "18:00"
  deliveryWindow: string;     // "9:00-13:00"
  capacityUsed: number;       // Percentage of capacity used
  maxCapacity: number;        // Max orders for this delivery
  currentOrders: number;      // Current orders placed
};

export type InventoryForecast = {
  week: string;               // "2024-W01"
  deliveryDate: string;       // ISO date
  available: {
    [sku: string]: {
      available: number;
      reserved: number;
      total: number;
    };
  };
  production: WeeklyProduction;
};

export type UserProfile = {
  _id?: string;
  userId: string;             // NextAuth user ID
  email: string;
  name: string;
  phone?: string;
  defaultDeliveryAddress: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryPreferences: {
    preferredDay: number;     // 0-6 (Sunday-Saturday)
    deliveryWindow: string;   // "9:00-13:00"
    deliveryInstructions?: string;
    autoRenew: boolean;
  };
  subscriptionDiscount: number; // Percentage discount for subscribers
  createdAt: string;
  updatedAt: string;
};

export type AuthProvider = "google" | "apple" | "email";

export type UserSession = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    provider: AuthProvider;
  };
  profile?: UserProfile;
};

// Guest Order Tracking
export type GuestOrder = {
  _id?: string;
  email: string;
  stripeSessionId: string;
  orderData: {
    customer: CustomerData;
    cart: any[];
    totalAmount: number;
    deliveryDate: string;
  };
  createdAt: string;
  linkedToAccount?: string; // When user creates account
  marketingOptIn: boolean;
};

// Enhanced Customer Data
export type CustomerData = {
  email: string;
  name: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  deliveryInstructions?: string;
  preferredDeliveryDay?: string;
  marketingOptIn: boolean;
  source: "guest" | "google" | "apple" | "email";
  firstOrderDate?: string;
  totalOrders?: number;
};

// Subscription Tiers
export type SubscriptionTier = {
  name: "basic" | "premium" | "pro";
  discount: number;
  freeDelivery: boolean;
  prioritySupport: boolean;
  exclusiveProducts: string[];
  loyaltyMultiplier: number;
};

// Loyalty Program
export type LoyaltyTransaction = {
  _id?: string;
  userId: string;
  type: "earn" | "redeem";
  points: number;
  source: "purchase" | "subscription" | "referral" | "bonus" | "redemption";
  orderId?: string;
  description: string;
  createdAt: string;
};

// Email Marketing
export type EmailListMember = {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  source: string;
  subscriptionTier?: string;
  loyaltyPoints?: number;
  lastOrderDate?: string;
  createdAt: string;
};

