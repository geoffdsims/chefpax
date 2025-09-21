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
      sku: "CHEFPAX_4OZ",
      name: "ChefPax Mix — 4 oz",
      priceCents: 700,
      unit: "clamshell" as const,
      active: true,
      sort: 1,
      category: "mix" as const,
      variety: "mixed" as const,
      sizeOz: 4,
      weeklyCapacity: inventory.chefMix4oz,
      currentWeekAvailable: inventory.chefMix4oz,
      photoUrl: "/images/microgeens/chefPax_mix.png"
    },
    {
      sku: "SUNFLOWER_2OZ",
      name: "Sunflower Microgreens — 2 oz",
      priceCents: 500,
      unit: "clamshell" as const,
      active: true,
      sort: 2,
      category: "single" as const,
      variety: "sunflower" as const,
      sizeOz: 2,
      weeklyCapacity: inventory.sunflower2oz,
      currentWeekAvailable: inventory.sunflower2oz,
      photoUrl: "/images/sunflower.png"
    },
    {
      sku: "PEA_2OZ",
      name: "Pea Shoots — 2 oz",
      priceCents: 500,
      unit: "clamshell" as const,
      active: true,
      sort: 3,
      category: "single" as const,
      variety: "pea" as const,
      sizeOz: 2,
      weeklyCapacity: inventory.pea2oz,
      currentWeekAvailable: inventory.pea2oz,
      photoUrl: "/images/pea_shoots.png"
    },
    {
      sku: "RADISH_2OZ",
      name: "Radish Microgreens — 2 oz",
      priceCents: 500,
      unit: "clamshell" as const,
      active: true,
      sort: 4,
      category: "single" as const,
      variety: "radish" as const,
      sizeOz: 2,
      weeklyCapacity: inventory.radish2oz,
      currentWeekAvailable: inventory.radish2oz,
      photoUrl: "/images/radish_saxa2.png"
    },
    {
      sku: "PEA_LIVE_TRAY",
      name: "Live Tray — Pea Shoots (10×20)",
      priceCents: 3000,
      unit: "tray" as const,
      active: true,
      sort: 5,
      category: "live_tray" as const,
      variety: "pea" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: inventory.liveTrays.pea,
      currentWeekAvailable: inventory.liveTrays.pea,
      photoUrl: "/images/pea_shoots.png"
    },
    {
      sku: "RADISH_LIVE_TRAY",
      name: "Live Tray — Radish (10×20)",
      priceCents: 3000,
      unit: "tray" as const,
      active: true,
      sort: 6,
      category: "live_tray" as const,
      variety: "radish" as const,
      sizeOz: 200, // 10x20 tray
      weeklyCapacity: inventory.liveTrays.radish,
      currentWeekAvailable: inventory.liveTrays.radish,
      photoUrl: "/images/radish_saxa2.png"
    }
  ];
}
