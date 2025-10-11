import type { Product } from "./schema";

/**
 * ChefPax Product Catalog - All 14 Varieties
 * Updated from verified grow cards with accurate lead times and growing parameters
 */

export function getProductsWithInventory(): Product[] {
  return [
    // CORE LINE - High Volume (10×20 only)
    {
      _id: "sunflower-live-tray",
      sku: "SUNFLOWER_LIVE_TRAY",
      name: "Black Oil Sunflower Live Tray (10×20)",
      priceCents: 3200,
      unit: "tray",
      active: true,
      sort: 1,
      category: "live_tray",
      variety: "sunflower",
      sizeOz: 200,
      weeklyCapacity: 3, // 12 pods + 3 flats = 15 total, reserve 3 for live
      currentWeekAvailable: 3,
      photoUrl: "/images/sunflower.png",
      description: "Nutty, crunchy sunflower microgreens. Perfect for salads, avocado toast, and grain bowls. 6-10 harvests per tray.",
      leadTimeDays: 10, // Harvest at day 8-10
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 11 oz evenly, weighted dome" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "2-3 day blackout, 72-75°F, 90-95% humidity" },
        { type: "LIGHT", offsetDays: 3, durationDays: 6, notes: "Day 3-4 to light, Tier 1, 25min flood, 12-16h light" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10: Cotyledons fully open, rinse & spin-dry" },
        { type: "PACK", offsetDays: 10, notes: "Package live tray for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },
    {
      _id: "pea-live-tray",
      sku: "PEA_LIVE_TRAY",
      name: "Dun Pea Shoots Live Tray (10×20)",
      priceCents: 2500,
      unit: "tray",
      active: true,
      sort: 2,
      category: "live_tray",
      variety: "pea",
      sizeOz: 200,
      weeklyCapacity: 4, // 12 pods + 4 flats = 16 total, reserve 4 for live
      currentWeekAvailable: 4,
      photoUrl: "/images/pea_shoots.png",
      description: "Sweet snap-pea flavor with tender crunchy stems. Soak seeds 8 hours before sowing. 6-10 harvests per tray.",
      leadTimeDays: 10, // Harvest at day 8-10
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Soak 8h first! Broadcast 8.5 oz, weighted mat" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, 70-75°F, 85-95% humidity" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Day 3 to light, Tier 2, 25min flood, 12-16h light" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10: Tendrils unfurl, cut 2\" above mat" },
        { type: "PACK", offsetDays: 10, notes: "Trim roots, package live tray" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },
    {
      _id: "radish-live-tray",
      sku: "RADISH_LIVE_TRAY",
      name: "Rambo Purple Radish Live Tray (10×20)",
      priceCents: 2800,
      unit: "tray",
      active: true,
      sort: 3,
      category: "live_tray",
      variety: "radish",
      sizeOz: 200,
      weeklyCapacity: 6, // 6 pods + 6 flats = 12 total, reserve 6 for live
      currentWeekAvailable: 6,
      photoUrl: "/images/radish_saxa2.png",
      description: "Bold spicy horseradish kick with vibrant purple color. Perfect for tacos, sandwiches, and poke bowls. 6-10 harvests per tray.",
      leadTimeDays: 9, // Harvest at day 7-9
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.75 oz evenly, light dome" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, 70-75°F, 85-90% humidity" },
        { type: "LIGHT", offsetDays: 2, durationDays: 6, notes: "Day 3 to light, Tier 3, 25min flood, strong airflow" },
        { type: "HARVEST", offsetDays: 9, notes: "Day 7-9: 2-3\" tall, vibrant purple" },
        { type: "PACK", offsetDays: 9, notes: "Package live tray for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },
    {
      _id: "broccoli-live-tray",
      sku: "BROCCOLI_LIVE_TRAY",
      name: "Waltham 29 Broccoli Live Tray (10×20)",
      priceCents: 2800,
      unit: "tray",
      active: true,
      sort: 4,
      category: "live_tray",
      variety: "broccoli",
      sizeOz: 200,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/broccoli.png",
      description: "Mild earthy brassica flavor. Perfect for smoothies, salads, and health shots. 6-10 harvests per tray.",
      leadTimeDays: 10, // Harvest at day 8-10
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.5 oz evenly" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, 70-72°F, 85-90% humidity" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Day 3 to light, Tier 2, 25min flood, 12-14h light" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10: Cotyledons flat and green" },
        { type: "PACK", offsetDays: 10, notes: "Package live tray for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },
    {
      _id: "kohlrabi-live-tray",
      sku: "KOHLRABI_LIVE_TRAY",
      name: "Purple Vienna Kohlrabi Live Tray (10×20)",
      priceCents: 2800,
      unit: "tray",
      active: true,
      sort: 5,
      category: "live_tray",
      variety: "kohlrabi",
      sizeOz: 200,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/kohlrabi.png",
      description: "Mild brassica with sweet crunch and purple stems. Great for salads and slaws. 6-10 harvests per tray.",
      leadTimeDays: 10, // Harvest at day 8-10
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.5 oz evenly" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, 70-75°F, 85-90% humidity" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Day 3 to light, Tier 3, 25min flood, 12-16h light" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10: Purple stems visible" },
        { type: "PACK", offsetDays: 10, notes: "Package live tray for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },
    {
      _id: "superfood-mix-live-tray",
      sku: "SUPERFOOD_MIX_LIVE_TRAY",
      name: "Superfood Mix Live Tray (10×20)",
      priceCents: 3500,
      unit: "tray",
      active: true,
      sort: 6,
      category: "live_tray",
      variety: "mixed",
      sizeOz: 200,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/superfood_mix.png",
      description: "Balanced peppery-to-sweet mix: Radish, Cabbage, Kale, Broccoli, Kohlrabi. Colorful salad base. 6-10 harvests per tray.",
      leadTimeDays: 10, // Harvest at day 8-10
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 2 oz mixed seeds" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, 70-75°F, 85-90% humidity" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Day 3 to light, Tier 3, 25min flood" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10: Color variation visible" },
        { type: "PACK", offsetDays: 10, notes: "Package live tray for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },
    
    // CORE-PREMIUM SPECIALTY
    {
      _id: "wasabi-mustard-live-tray",
      sku: "WASABI_MUSTARD_LIVE_TRAY",
      name: "Wasabi Mustard Live Tray (10×20)",
      priceCents: 3500,
      unit: "tray",
      active: true,
      sort: 7,
      category: "specialty",
      variety: "mustard",
      sizeOz: 200,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/wasabi_mustard.png",
      description: "⚠️ VERY SPICY! True wasabi heat. Perfect for sushi, Asian dishes, and bold flavor accents. Use sparingly. 6-10 harvests per tray.",
      leadTimeDays: 9, // Harvest at day 7-9
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.75 oz evenly" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, 70-75°F, 85-90% humidity" },
        { type: "LIGHT", offsetDays: 2, durationDays: 6, notes: "Day 3 to light, Tier 3, strong light for heat" },
        { type: "HARVEST", offsetDays: 9, notes: "Day 7-9: 2-3\" tall, potent aroma" },
        { type: "PACK", offsetDays: 9, notes: "Handle carefully - oils are strong!" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10
    },

    // PREMIUM LINE - Small Batch, High Margin (5×5 and 10×20)
    {
      _id: "amaranth-live-tray",
      sku: "AMARANTH_LIVE_TRAY",
      name: "Red Garnet Amaranth Live Tray (10×20)",
      priceCents: 4500,
      unit: "tray",
      active: true,
      sort: 10,
      category: "premium",
      variety: "amaranth",
      sizeOz: 200,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/amaranth_dreads.png",
      description: "Rich magenta microgreens with earthy beet-like flavor. Chef-favorite for fine dining garnish and visual contrast. 6-10 harvests per tray.",
      leadTimeDays: 12, // Harvest at day 10-12
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 4.5g, NO COVER, requires light!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT - Light from Day 0, 72-76°F" },
        { type: "LIGHT", offsetDays: 0, durationDays: 11, notes: "Continuous light, Tier 5, 18min flood, 12-14h/day" },
        { type: "HARVEST", offsetDays: 12, notes: "Day 10-12: Vibrant red, 2-3\" tall" },
        { type: "PACK", offsetDays: 12, notes: "Handle gently - delicate leaves" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 15
    },
    {
      _id: "amaranth-live-tray-5x5",
      sku: "AMARANTH_LIVE_TRAY_5X5",
      name: "Red Garnet Amaranth Live Tray (5×5)",
      priceCents: 1800,
      unit: "tray",
      active: true,
      sort: 11,
      category: "premium",
      variety: "amaranth",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/amaranth_dreads.png",
      description: "Small batch premium amaranth. Perfect for single-household orders. Rich magenta color. 3-5 harvests per tray.",
      leadTimeDays: 12,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1g, NO COVER" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "Light from Day 0, 72-76°F" },
        { type: "LIGHT", offsetDays: 0, durationDays: 11, notes: "Tier 5, light watering only" },
        { type: "HARVEST", offsetDays: 12, notes: "Day 10-12: Vibrant red" },
        { type: "PACK", offsetDays: 12, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 15
    },
    {
      _id: "basil-dark-opal-live-tray",
      sku: "BASIL_DARK_OPAL_LIVE_TRAY",
      name: "Basil Dark Opal Live Tray (5×5)",
      priceCents: 2200,
      unit: "tray",
      active: true,
      sort: 12,
      category: "premium",
      variety: "basil",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/basil_dark_opal.png",
      description: "Deep purple basil with sweet clove scent. Perfect for cocktails, desserts, and basil oil. 4-6 harvests per tray.",
      leadTimeDays: 15, // Harvest at day 12-15
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1.5g, mist lightly, LIGHT FROM DAY 0" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT, 72-78°F, indirect light → full by Day 3" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "Tier 5, 20min flood, gentle airflow, 12-16h light" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15: Purple leaves developed, cut ½\" above" },
        { type: "PACK", offsetDays: 15, notes: "Package carefully - aromatic" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 15
    },
    {
      _id: "basil-lemon-live-tray",
      sku: "BASIL_LEMON_LIVE_TRAY",
      name: "Basil Lemon Live Tray (5×5)",
      priceCents: 2200,
      unit: "tray",
      active: true,
      sort: 13,
      category: "premium",
      variety: "basil",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/basil_lemon.png",
      description: "Bright lemon-citrus basil with sweet notes. Perfect for seafood, fruit plates, and beverages. 4-6 harvests per tray.",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1.5g, mist, LIGHT FROM DAY 0" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT, 72-78°F, light mist 2x daily" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "Tier 4, 20min flood, 12-16h light" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15: Citrus aroma strong" },
        { type: "PACK", offsetDays: 15, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 15
    },
    {
      _id: "basil-thai-live-tray",
      sku: "BASIL_THAI_LIVE_TRAY",
      name: "Basil Thai Live Tray (5×5)",
      priceCents: 2200,
      unit: "tray",
      active: true,
      sort: 14,
      category: "premium",
      variety: "basil",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/basil_thai.png",
      description: "Sweet-spice with anise aroma. Glossy dark green with purple stems. Perfect for Asian curries and Thai dishes. 4-6 harvests per tray.",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow 1.5g on damp mat, LIGHT + WARMTH (74°F)" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT, lights on from Day 0, 74°F warmth" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "Tier 4, moderate water, 14-16h light, thin if crowded" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15: Anise aroma strong, purple stems" },
        { type: "PACK", offsetDays: 15, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 15
    },
    {
      _id: "shiso-live-tray",
      sku: "SHISO_LIVE_TRAY",
      name: "Shiso (Korean Perilla) Live Tray (5×5)",
      priceCents: 2500,
      unit: "tray",
      active: true,
      sort: 15,
      category: "premium",
      variety: "herb",
      sizeOz: 25,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/shiso.png",
      description: "Mint-basil-cinnamon blend with serrated leaves. Perfect for sushi, cocktails, and Asian cuisine. 4-6 harvests per tray.",
      leadTimeDays: 18, // Harvest at day 14-18
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1g, press gently, NO COVER, LIGHT FROM DAY 0" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 6, notes: "NO BLACKOUT, requires light, mist 2x daily for 5-7 days" },
        { type: "LIGHT", offsetDays: 0, durationDays: 17, notes: "Tier 5, low water, fast drain, 12-16h light, airflow" },
        { type: "HARVEST", offsetDays: 18, notes: "Day 14-18: Leaves ¾\", aromatic, serrated edges" },
        { type: "PACK", offsetDays: 18, notes: "Package carefully - fragrant" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 15
    }
  ];
}

/**
 * Get current week string in format "2024-W01"
 */
export function getCurrentWeekString(): string {
  const now = new Date();
  const year = now.getFullYear();
  
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}
