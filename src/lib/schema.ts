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
};

