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
  status: "paid" | "delivered" | "refunded";
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
  orderType: "one_time" | "subscription"; // New field
  subscriptionId?: string;    // If part of subscription
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

