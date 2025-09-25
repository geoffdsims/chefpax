import type { WeeklyProduction } from "./schema";

/**
 * Calculate weekly inventory based on production rotation
 * Based on your detailed production plan:
 * - 48 pods total capacity
 * - 20 flats total capacity
 * - Weekly sow schedule: Sat (Pea), Mon (Sunflower), Wed (Amaranth), Fri (Radish + Harvest)
 */

export function calculateWeeklyInventory(production: WeeklyProduction) {
  // Harvest yields per unit (conservative estimates)
  const podYields = {
    pea: 0.45,        // oz per pod
    sunflower: 0.35,  // oz per pod
    radish: 0.30      // oz per pod
  };

  const flatYields = {
    pea: 10,          // oz per 10x20 tray
    sunflower: 10,    // oz per 10x20 tray
    radish: 7,        // oz per 10x20 tray
    amaranth: 3.5     // oz per 10x20 tray
  };

  // Calculate total harvest weights
  const weeklyWeights = {
    pea: (production.pods.pea * podYields.pea) + (production.flats.pea * flatYields.pea),
    sunflower: (production.pods.sunflower * podYields.sunflower) + (production.flats.sunflower * flatYields.sunflower),
    radish: (production.pods.radish * podYields.radish) + (production.flats.radish * flatYields.radish),
    amaranth: production.flats.amaranth * flatYields.amaranth
  };

  // Reserve live trays first (subtract their weights)
  const peaCuttable = weeklyWeights.pea - (production.liveTrayReservations.pea * flatYields.pea);
  const radCuttable = weeklyWeights.radish - (production.liveTrayReservations.radish * flatYields.radish);
  const sunCuttable = weeklyWeights.sunflower;
  const mixable = peaCuttable + sunCuttable + radCuttable;

  // Allocate remaining inventory
  const chefMixOz = Math.floor(mixable * 0.40);      // 40% to ChefPax Mix
  const singlesOz = Math.floor(mixable * 0.50);      // 50% to single varieties
  const bufferOz = mixable - chefMixOz - singlesOz;  // 10% buffer

  // Calculate units available
  const chefMixUnits4oz = Math.floor(chefMixOz / 4);
  const sunSingles2oz = Math.floor((singlesOz * (sunCuttable / mixable)) / 2);
  const peaSingles2oz = Math.floor((singlesOz * (peaCuttable / mixable)) / 2);
  const radSingles2oz = Math.floor((singlesOz * (radCuttable / mixable)) / 2);

  return {
    chefMix4oz: chefMixUnits4oz,
    sunflower2oz: sunSingles2oz,
    pea2oz: peaSingles2oz,
    radish2oz: radSingles2oz,
    liveTrays: {
      pea: production.liveTrayReservations.pea,
      radish: production.liveTrayReservations.radish
    },
    totals: {
      chefMixOz,
      singlesOz,
      bufferOz,
      totalMixableOz: mixable
    }
  };
}

/**
 * Get standard weekly production plan
 * This matches your documented rotation
 */
export function getStandardWeeklyProduction(): WeeklyProduction {
  return {
    week: getCurrentWeekString(),
    pods: {
      pea: 12,        // sow Saturday
      sunflower: 12,  // sow Monday
      radish: 6       // sow Friday
    },
    flats: {
      pea: 4,         // sow Saturday
      sunflower: 3,   // sow Monday
      radish: 6,      // sow Friday
      amaranth: 1     // sow Wednesday
    },
    liveTrayReservations: {
      pea: 1,         // 1 tray reserved for live
      radish: 2       // 2 trays reserved for live
    }
  };
}

/**
 * Get current week string in format "2024-W01"
 */
export function getCurrentWeekString(): string {
  const now = new Date();
  const year = now.getFullYear();
  
  // Get week number
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get products with calculated inventory for this week
 */
export function getProductsWithInventory() {
  const production = getStandardWeeklyProduction();
  const inventory = calculateWeeklyInventory(production);

  return [
    {
      sku: "CHEFPAX_MIX_LIVE_TRAY",
      name: "ChefPax Mix Live Tray (10×20)",
      priceCents: 3500,
      unit: "tray" as const,
      active: true,
      sort: 1,
      category: "live_tray" as const,
      variety: "mixed" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: 2, // 2 mixed trays per week
      currentWeekAvailable: 2,
      photoUrl: "/images/microgeens/chefPax_mix.png",
      description: "Our signature ChefPax mix grown together in one live tray. 6-10 harvests of pea shoots, sunflower, and radish microgreens. Cut fresh as needed for maximum nutrition."
    },
    {
      sku: "PEA_LIVE_TRAY",
      name: "Live Tray — Pea Shoots (10×20)",
      priceCents: 2500, // Lower price - high yield, easy to grow
      unit: "tray" as const,
      active: true,
      sort: 2,
      category: "live_tray" as const,
      variety: "pea" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: inventory.liveTrays.pea,
      currentWeekAvailable: inventory.liveTrays.pea,
      photoUrl: "/images/pea_shoots.png",
      description: "Fresh pea shoots grown hydroponically in live trays. High yield variety - cut fresh as needed for maximum nutrition and longevity."
    },
    {
      sku: "RADISH_LIVE_TRAY",
      name: "Live Tray — Radish (10×20)",
      priceCents: 2800, // Slightly higher - moderate yield, popular variety
      unit: "tray" as const,
      active: true,
      sort: 3,
      category: "live_tray" as const,
      variety: "radish" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: inventory.liveTrays.radish,
      currentWeekAvailable: inventory.liveTrays.radish,
      photoUrl: "/images/radish_saxa2.png",
      description: "Spicy radish microgreens grown hydroponically in live trays. Cut fresh as needed for maximum nutrition and longevity."
    },
    {
      sku: "SUNFLOWER_LIVE_TRAY",
      name: "Live Tray — Sunflower (10×20)",
      priceCents: 3200, // Higher price - moderate yield, premium taste
      unit: "tray" as const,
      active: true,
      sort: 4,
      category: "live_tray" as const,
      variety: "sunflower" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: 2, // Add some sunflower live trays
      currentWeekAvailable: 2,
      photoUrl: "/images/sunflower.png",
      description: "Nutty sunflower microgreens grown hydroponically in live trays. Premium variety - cut fresh as needed for maximum nutrition and longevity."
    },
    {
      sku: "AMARANTH_LIVE_TRAY",
      name: "Live Tray — Amaranth (10×20)",
      priceCents: 4500, // Premium price - low yield, high seed cost, unique color
      unit: "tray" as const,
      active: true,
      sort: 5,
      category: "live_tray" as const,
      variety: "amaranth" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: 1, // Add amaranth live trays
      currentWeekAvailable: 1,
      photoUrl: "/images/amaranth_dreads.png",
      description: "Colorful amaranth microgreens grown hydroponically in live trays. Luxe variety with vibrant color - cut fresh as needed for maximum nutrition and longevity."
    },
    {
      sku: "CHEFPAX_PREMIUM_MIX_LIVE_TRAY",
      name: "Luxe ChefPax Mix Live Tray (10×20)",
      priceCents: 5500, // Premium pricing for brand growth
      unit: "tray" as const,
      active: true,
      sort: 6,
      category: "premium_live_tray" as const,
      variety: "mixed" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: 1, // Limited premium mixed trays
      currentWeekAvailable: 1,
      photoUrl: "/images/microgeens/chefPax_mix.png",
      description: "Luxe ChefPax mix curated for brand growth. 6-10 harvests of our finest microgreens grown together in live trays. Perfect for Instagram-worthy dishes and culinary excellence."
    },
    {
      sku: "PEA_PREMIUM_LIVE_TRAY",
      name: "Luxe Live Tray — Pea Shoots (10×20)",
      priceCents: 4000, // Premium pricing for brand growth
      unit: "tray" as const,
      active: true,
      sort: 7,
      category: "premium_live_tray" as const,
      variety: "pea" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: 1, // Limited premium trays
      currentWeekAvailable: 1,
      photoUrl: "/images/pea_shoots.png",
      description: "Luxe pea shoots curated for brand growth. Perfect for elevating your culinary presentation and growing your brand reputation."
    },
    {
      sku: "RADISH_PREMIUM_LIVE_TRAY",
      name: "Luxe Live Tray — Radish (10×20)",
      priceCents: 4200, // Premium pricing for brand growth
      unit: "tray" as const,
      active: true,
      sort: 8,
      category: "premium_live_tray" as const,
      variety: "radish" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: 1, // Limited premium trays
      currentWeekAvailable: 1,
      photoUrl: "/images/radish_saxa2.png",
      description: "Luxe radish microgreens curated for brand growth. Perfect for elevating your culinary presentation and growing your brand reputation."
    }
  ];
}
