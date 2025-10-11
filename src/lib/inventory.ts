import type { Product } from "./schema";

/**
 * ChefPax Product Catalog
 * Synced with Stripe products created by seed-stripe-products.js
 * Pricing matches Stripe: 10×20 = $30, 5×5 = $12-15
 */

export function getProductsWithInventory(): Product[] {
  return [
    // CORE LINE - 10×20 Trays ($30 one-time, $28/week, $110/month)
    {
      _id: "sunflower-live-tray",
      sku: "SUNFLOWER_LIVE_TRAY",
      name: "Black Oil Sunflower — Live Tray",
      priceCents: 3000, // $30 matches Stripe
      unit: "tray",
      active: true,
      sort: 1,
      category: "live_tray",
      variety: "sunflower",
      sizeOz: 200,
      weeklyCapacity: 3,
      currentWeekAvailable: 3,
      photoUrl: "/images/sunflower.png",
      description: "Nutty, crunchy, lightly sweet. 10×20 live tray - 6-10 harvests. Perfect for salads, avocado toast, grain bowls. 8-10 days to harvest.",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 11 oz, weighted dome" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "2.5 day blackout, Tier 1" },
        { type: "LIGHT", offsetDays: 3, durationDays: 6, notes: "25min flood, high water" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "sunflower-live-tray:10x20:one_time:usd"
    },
    {
      _id: "peas-live-tray",
      sku: "PEAS_LIVE_TRAY",
      name: "Dun Pea Shoots — Live Tray",
      priceCents: 3000,
      unit: "tray",
      active: true,
      sort: 2,
      category: "live_tray",
      variety: "pea",
      sizeOz: 200,
      weeklyCapacity: 4,
      currentWeekAvailable: 4,
      photoUrl: "/images/pea_shoots.png",
      description: "Sweet snap-pea flavor, tender crunchy stems. 10×20 live tray - 6-10 harvests. Perfect for wraps, omelets, Asian salads. 8-10 days to harvest.",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Soak 8h! Broadcast 8.5 oz" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, Tier 2" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "25min flood, high water" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10, cut 2\" above mat" },
        { type: "PACK", offsetDays: 10, notes: "Trim roots" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "peas-live-tray:10x20:one_time:usd"
    },
    {
      _id: "radish-rambo-live-tray",
      sku: "RADISH_RAMBO_LIVE_TRAY",
      name: "Rambo Purple Radish — Live Tray",
      priceCents: 3000,
      unit: "tray",
      active: true,
      sort: 3,
      category: "live_tray",
      variety: "radish",
      sizeOz: 200,
      weeklyCapacity: 6,
      currentWeekAvailable: 6,
      photoUrl: "/images/radish_saxa2.png",
      description: "Bold spicy horseradish kick, vibrant purple color. 10×20 live tray - 6-10 harvests. Perfect for tacos, sandwiches, poke bowls. 7-9 days to harvest.",
      leadTimeDays: 9,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.75 oz" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, Tier 3" },
        { type: "LIGHT", offsetDays: 2, durationDays: 6, notes: "25min flood, moderate water" },
        { type: "HARVEST", offsetDays: 9, notes: "Day 7-9" },
        { type: "PACK", offsetDays: 9, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "radish-rambo-live-tray:10x20:one_time:usd"
    },
    {
      _id: "broccoli-live-tray",
      sku: "BROCCOLI_LIVE_TRAY",
      name: "Waltham 29 Broccoli — Live Tray",
      priceCents: 3000,
      unit: "tray",
      active: true,
      sort: 4,
      category: "live_tray",
      variety: "broccoli",
      sizeOz: 200,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/broccoli.png",
      description: "Mild brassica, slightly earthy. Perfect for smoothies and health shots. Harvest: 8-10 days.",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.5 oz" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, Tier 2" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "25min flood, 12-14h light" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "broccoli-live-tray:10x20:one_time:usd"
    },
    {
      _id: "kohlrabi-early-purple-live-tray",
      sku: "KOHLRABI_EARLY_PURPLE_LIVE_TRAY",
      name: "Early Purple Vienna Kohlrabi — Live Tray",
      priceCents: 3000,
      unit: "tray",
      active: true,
      sort: 5,
      category: "live_tray",
      variety: "kohlrabi",
      sizeOz: 200,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/kohlrabi.png",
      description: "Mild brassica, sweet crunch. Perfect for salads and slaws. Harvest: 8-10 days.",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.5 oz" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, Tier 3" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "25min flood" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "kohlrabi-early-purple-live-tray:10x20:one_time:usd"
    },
    {
      _id: "superfood-mix-live-tray",
      sku: "SUPERFOOD_MIX_LIVE_TRAY",
      name: "Superfood Mix — Live Tray",
      priceCents: 3000,
      unit: "tray",
      active: true,
      sort: 6,
      category: "live_tray",
      variety: "mixed",
      sizeOz: 200,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/superfood_mix.png",
      description: "Peppery + mild mix: Radish, Cabbage, Kale, Broccoli, Kohlrabi. Harvest: 8-10 days.",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 2 oz mixed seeds" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, Tier 3" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "25min flood" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package for delivery" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "superfood-mix-live-tray:10x20:one_time:usd"
    },
    {
      _id: "wasabi-mustard-live-tray",
      sku: "WASABI_MUSTARD_LIVE_TRAY_10X20",
      name: "Wasabi Mustard — Live Tray (10×20)",
      priceCents: 3000,
      unit: "tray",
      active: true,
      sort: 7,
      category: "specialty",
      variety: "mustard",
      sizeOz: 200,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/wasabi_mustard.png",
      description: "⚠️ EXTREME HEAT! True wasabi flavor. Harvest: 7-9 days.",
      leadTimeDays: 9,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Broadcast 1.75 oz" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout, Tier 3" },
        { type: "LIGHT", offsetDays: 2, durationDays: 6, notes: "25min flood" },
        { type: "HARVEST", offsetDays: 9, notes: "Day 7-9" },
        { type: "PACK", offsetDays: 9, notes: "Warning label!" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "wasabi-mustard-live-tray:10x20:one_time:usd"
    },
    {
      _id: "wasabi-mustard-5x5",
      sku: "WASABI_MUSTARD_5X5",
      name: "Wasabi Mustard — 5×5",
      priceCents: 1300, // $13 matches Stripe 5x5 pricing
      unit: "tray",
      active: true,
      sort: 8,
      category: "specialty",
      variety: "mustard",
      sizeOz: 25,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/wasabi_mustard.png",
      description: "⚠️ EXTREME HEAT! Small batch wasabi mustard. Harvest: 7-9 days.",
      leadTimeDays: 9,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Small tray 5×5" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "2 day blackout" },
        { type: "LIGHT", offsetDays: 2, durationDays: 6, notes: "Tier 3" },
        { type: "HARVEST", offsetDays: 9, notes: "Day 7-9" },
        { type: "PACK", offsetDays: 9, notes: "Package" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "wasabi-mustard-live-tray:5x5:one_time:usd"
    },

    // PREMIUM LINE - 5×5 Trays ($12-15 one-time, $11-14/week)
    {
      _id: "amaranth-red-5x5",
      sku: "AMARANTH_RED_5X5",
      name: "Red Garnet Amaranth — 5×5",
      priceCents: 1400, // $14 matches Stripe override
      unit: "tray",
      active: true,
      sort: 10,
      category: "premium",
      variety: "amaranth",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/amaranth_dreads.png",
      description: "Earthy, beet-like, delicate. Rich magenta color. Harvest: 10-12 days. NO BLACKOUT - light from Day 0!",
      leadTimeDays: 12,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1g, NO COVER, LIGHT FROM DAY 0!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT! Light from Day 0, Tier 5" },
        { type: "LIGHT", offsetDays: 0, durationDays: 11, notes: "18min flood, light water only" },
        { type: "HARVEST", offsetDays: 12, notes: "Day 10-12" },
        { type: "PACK", offsetDays: 12, notes: "Handle gently" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "amaranth-red-5x5:5x5:one_time:usd"
    },
    {
      _id: "basil-dark-opal-5x5",
      sku: "BASIL_DARK_OPAL_5X5",
      name: "Basil Dark Opal — 5×5",
      priceCents: 1300,
      unit: "tray",
      active: true,
      sort: 11,
      category: "premium",
      variety: "basil",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/basil_dark_opal.png",
      description: "Sweet, clove scent. Deep purple leaves. Harvest: 12-15 days. NO BLACKOUT - light from Day 0!",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1.5g, LIGHT FROM DAY 0!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT! Tier 5" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "20min flood, light water" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15" },
        { type: "PACK", offsetDays: 15, notes: "Aromatic packaging" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "basil-dark-opal-5x5:5x5:one_time:usd"
    },
    {
      _id: "basil-lemon-5x5",
      sku: "BASIL_LEMON_5X5",
      name: "Basil Lemon — 5×5",
      priceCents: 1300,
      unit: "tray",
      active: true,
      sort: 12,
      category: "premium",
      variety: "basil",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/basil_lemon.png",
      description: "Bright lemon-citrus basil. Perfect for seafood and beverages. Harvest: 12-15 days. NO BLACKOUT!",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1.5g, LIGHT FROM DAY 0!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT! Tier 4" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "20min flood" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15" },
        { type: "PACK", offsetDays: 15, notes: "Package" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "basil-lemon-5x5:5x5:one_time:usd"
    },
    {
      _id: "basil-thai-5x5",
      sku: "BASIL_THAI_5X5",
      name: "Basil Thai — 5×5",
      priceCents: 1200, // $12 matches Stripe override
      unit: "tray",
      active: true,
      sort: 13,
      category: "premium",
      variety: "basil",
      sizeOz: 25,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/basil_thai.png",
      description: "Sweet-spice, anise aroma. Dark green with purple stems. Harvest: 12-15 days. NO BLACKOUT!",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow 1.5g, LIGHT + 74°F warmth!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT! Tier 4" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "20min flood, 14-16h light" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15" },
        { type: "PACK", offsetDays: 15, notes: "Package" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "basil-thai-5x5:5x5:one_time:usd"
    },
    {
      _id: "shiso-5x5",
      sku: "SHISO_5X5",
      name: "Shiso (Perilla Korean) — 5×5",
      priceCents: 1500, // $15 matches Stripe override
      unit: "tray",
      active: true,
      sort: 14,
      category: "premium",
      variety: "herb",
      sizeOz: 25,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/shiso.png",
      description: "Basil-mint-cinnamon flavor. Serrated leaves. Harvest: 14-18 days. NO BLACKOUT!",
      leadTimeDays: 18,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Surface sow 1g, NO COVER, LIGHT FROM DAY 0!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 6, notes: "NO BLACKOUT! Mist 2x daily, Tier 5" },
        { type: "LIGHT", offsetDays: 0, durationDays: 17, notes: "18min flood, low water" },
        { type: "HARVEST", offsetDays: 18, notes: "Day 14-18" },
        { type: "PACK", offsetDays: 18, notes: "Fragrant packaging" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "shiso-5x5:5x5:one_time:usd"
    },

    // BUNDLES
    {
      _id: "bundle-core-4pack",
      sku: "BUNDLE_CORE_4PACK",
      name: "Core 4-Pack (10×20)",
      priceCents: 11500, // $115 (save $5)
      unit: "bundle",
      active: true,
      sort: 20,
      category: "bundle",
      variety: "mixed",
      sizeOz: 800,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/bundle_core.png",
      description: "4 live trays (10×20): Sunflower, Pea Shoots, Rambo Radish, Broccoli. Harvest 8-10 days. Save $5 vs individual!",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow all 4 varieties" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "Blackout for all" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Various tiers" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package bundle" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "bundle-core-4pack:bundle:one_time:usd"
    },
    {
      _id: "bundle-brassica-trio",
      sku: "BUNDLE_BRASSICA_TRIO",
      name: "Brassica Builder Trio (10×20)",
      priceCents: 8700, // $87 (save $3)
      unit: "bundle",
      active: true,
      sort: 21,
      category: "bundle",
      variety: "mixed",
      sizeOz: 600,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/bundle_brassica.png",
      description: "3 live trays (10×20): Broccoli, Kohlrabi, Wasabi Mustard. Bold brassica flavors. Harvest 8-10 days. Save $3!",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow all 3" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "Blackout" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Tier 2-3" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package bundle" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "bundle-brassica-trio:bundle:one_time:usd"
    },
    {
      _id: "bundle-superfood-duo",
      sku: "BUNDLE_SUPERFOOD_DUO",
      name: "Superfood Duo (10×20)",
      priceCents: 5700, // $57 (save $3)
      unit: "bundle",
      active: true,
      sort: 22,
      category: "bundle",
      variety: "mixed",
      sizeOz: 400,
      weeklyCapacity: 2,
      currentWeekAvailable: 2,
      photoUrl: "/images/bundle_superfood.png",
      description: "Superfood Mix + Rambo Radish (10×20). Save $3!",
      leadTimeDays: 10,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow both" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 2, notes: "Blackout" },
        { type: "LIGHT", offsetDays: 2, durationDays: 7, notes: "Tier 3" },
        { type: "HARVEST", offsetDays: 10, notes: "Day 8-10" },
        { type: "PACK", offsetDays: 10, notes: "Package bundle" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "bundle-superfood-duo:bundle:one_time:usd"
    },
    {
      _id: "bundle-premium-4x5x5",
      sku: "BUNDLE_PREMIUM_4X5X5",
      name: "Chef's Premium 4×5×5",
      priceCents: 5000, // $50
      unit: "bundle",
      active: true,
      sort: 23,
      category: "bundle",
      variety: "mixed",
      sizeOz: 100,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/bundle_premium.png",
      description: "Shiso, Dark Opal Basil, Lemon Basil, Thai Basil (5×5). Premium herb collection!",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow all 4, LIGHT FROM DAY 0!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT! Tier 4-5" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "Light water, 20min flood" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15" },
        { type: "PACK", offsetDays: 15, notes: "Package premium bundle" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "bundle-premium-4x5x5:bundle:one_time:usd"
    },
    {
      _id: "bundle-color-pop-4x5x5",
      sku: "BUNDLE_COLOR_POP_4X5X5",
      name: "Color Pop 4×5×5",
      priceCents: 5000, // $50
      unit: "bundle",
      active: true,
      sort: 24,
      category: "bundle",
      variety: "mixed",
      sizeOz: 100,
      weeklyCapacity: 1,
      currentWeekAvailable: 1,
      photoUrl: "/images/bundle_colorpop.png",
      description: "Red Garnet Amaranth + three basils (5×5). Stunning visual variety!",
      leadTimeDays: 15,
      isSubscriptionEligible: true,
      stages: [
        { type: "SEED", offsetDays: 0, notes: "Sow all 4, LIGHT FROM DAY 0!" },
        { type: "GERMINATE", offsetDays: 0, durationDays: 3, notes: "NO BLACKOUT! Tier 4-5" },
        { type: "LIGHT", offsetDays: 0, durationDays: 14, notes: "Light water" },
        { type: "HARVEST", offsetDays: 15, notes: "Day 12-15" },
        { type: "PACK", offsetDays: 15, notes: "Package colorful bundle" }
      ],
      subscriptionEnabled: true,
      subscriptionDiscount: 10,
      stripePriceId: "bundle-color-pop-4x5x5:bundle:one_time:usd"
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
