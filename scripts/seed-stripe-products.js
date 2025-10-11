/**
 * ChefPax — Stripe seeder (JSON-driven, size-aware)
 * -------------------------------------------------
 * - Reads latest JSON with corrected items/sizes
 * - Creates Products (one per crop) and size-specific Prices
 * - Uses stable lookup_keys: `${slug}:${size}:${term}:usd`
 * - Adds bundle Products with one-time / weekly / monthly prices
 *
 * Safe to re-run. Idempotent via product metadata.slug + price.lookup_key.
 */

const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

/* ---------- Config ---------- */

// Use env override if you prefer a different file name/path
const JSON_FILENAME =
  process.env.CHEFPAX_JSON || "chefpax_grow_cards_dashboard_full (1).json";

// Pricing rules
const PRICING = {
  // 10×20 "core" style trays (incl. core-premium if 10×20 exists)
  "10x20": {
    one_time_cents: 3000,  // $30
    weekly_cents: 2800,    // $28/week
    monthly_cents: 11000,  // $110/month (≈4 deliveries)
  },
  // Premium 5×5 (formerly "rounder")
  "5x5": {
    one_time_cents: 1300,  // $13 default
    weekly_cents: 1200,    // $12/week
  },
  // Optional per-crop overrides for 5×5
  overrides_5x5: {
    "amaranth-red-5x5": { one_time_cents: 1400, weekly_cents: 1300 },
    "shiso-5x5": { one_time_cents: 1500, weekly_cents: 1400 },
    "basil-thai-5x5": { one_time_cents: 1200, weekly_cents: 1100 },
  },
};

// Bundles (unchanged logic; contents are crop ids from the JSON)
const BUNDLES = [
  {
    slug: "bundle-core-4pack",
    name: "Core 4-Pack (10×20)",
    description: "Sunflower, Pea Shoots, Rambo Radish, Broccoli (10×20).",
    contents: [
      "sunflower-live-tray",
      "peas-live-tray",
      "radish-rambo-live-tray",
      "broccoli-live-tray",
    ],
    prices: { one_time_cents: 11500, weekly_cents: 10800, monthly_cents: 42000 },
  },
  {
    slug: "bundle-brassica-trio",
    name: "Brassica Builder Trio (10×20)",
    description: "Broccoli, Early Purple Kohlrabi, Wasabi Mustard (10×20).",
    contents: [
      "broccoli-live-tray",
      "kohlrabi-early-purple-live-tray",
      "wasabi-mustard-live-tray",
    ],
    prices: { one_time_cents: 8700, weekly_cents: 8100, monthly_cents: 31500 },
  },
  {
    slug: "bundle-superfood-duo",
    name: "Superfood Duo (10×20)",
    description: "Superfood Mix + Rambo Radish (10×20).",
    contents: ["superfood-mix-live-tray", "radish-rambo-live-tray"],
    prices: { one_time_cents: 5700, weekly_cents: 5400, monthly_cents: 21000 },
  },
  {
    slug: "bundle-premium-4x5x5",
    name: "Chef's Premium 4×5×5",
    description: "Shiso, Dark Opal Basil, Lemon Basil, Thai Basil (5×5).",
    contents: ["shiso-5x5", "basil-dark-opal-5x5", "basil-lemon-5x5", "basil-thai-5x5"],
    prices: { one_time_cents: 5000, weekly_cents: 4600 },
  },
  {
    slug: "bundle-color-pop-4x5x5",
    name: "Color Pop 4×5×5",
    description: "Red Garnet Amaranth + three basils (5×5).",
    contents: ["amaranth-red-5x5", "basil-dark-opal-5x5", "basil-lemon-5x5", "basil-thai-5x5"],
    prices: { one_time_cents: 5000, weekly_cents: 4600 },
  },
];

/* ---------- Helpers ---------- */

async function upsertProduct({ name, slug, description, metadata = {}, images = [] }) {
  const found = await stripe.products.search({
    query: `active:'true' AND metadata['slug']:'${slug}'`,
    limit: 1,
  });
  if (found.data[0]) return found.data[0];

  return stripe.products.create({
    name,
    description,
    images,
    active: true,
    metadata: { slug, ...metadata },
  });
}

async function ensurePrice({ productId, lookup_key, unit_amount, type = "one_time", interval, nickname }) {
  const existing = await stripe.prices.list({ lookup_keys: [lookup_key], expand: ["data.product"] });
  if (existing.data[0]) return existing.data[0];

  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount,
    nickname,
    lookup_key,
    ...(type === "recurring" ? { recurring: { interval } } : {}),
  });
}

async function setDefaultPrice(productId, priceId) {
  await stripe.products.update(productId, { default_price: priceId });
}

/* ---------- Main ---------- */

(async () => {
  try {
    const jsonPath = path.resolve(process.cwd(), JSON_FILENAME);
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(raw);

    if (!data || !Array.isArray(data.crops)) {
      throw new Error("Invalid JSON: expected { crops: [] }");
    }

    console.log(`Loaded ${JSON_FILENAME}. Found ${data.crops.length} crops.`);

    // Index for bundle validation
    const byId = Object.fromEntries(data.crops.map(c => [c.id, c]));

    // 1) Products & size-aware Prices
    for (const crop of data.crops) {
      const slug = crop.id;                 // stable id from JSON
      const sizes = crop.tray_sizes || [];  // e.g., ["10x20"], ["5x5"], or both
      const name = displayName(crop);
      const description = describe(crop);

      const product = await upsertProduct({
        name,
        slug,
        description,
        metadata: {
          slug,
          category: crop.category || "",
          sizes: sizes.join(","),
          botanical_name: crop.botanical_name || "",
        },
      });

      // Create prices per available size
      // 10×20 rules
      if (sizes.includes("10x20")) {
        const pOne = await ensurePrice({
          productId: product.id,
          lookup_key: `${slug}:10x20:one_time:usd`,
          unit_amount: PRICING["10x20"].one_time_cents,
          type: "one_time",
          nickname: "One-time (10×20)",
        });
        const pW = await ensurePrice({
          productId: product.id,
          lookup_key: `${slug}:10x20:weekly:usd`,
          unit_amount: PRICING["10x20"].weekly_cents,
          type: "recurring",
          interval: "week",
          nickname: "Weekly subscription (10×20)",
        });
        const pM = await ensurePrice({
          productId: product.id,
          lookup_key: `${slug}:10x20:monthly:usd`,
          unit_amount: PRICING["10x20"].monthly_cents,
          type: "recurring",
          interval: "month",
          nickname: "Monthly subscription (10×20)",
        });

        // Default to 10×20 one-time if present
        await setDefaultPrice(product.id, pOne.id);
        console.log(`✓ ${name} (10×20) → $${(pOne.unit_amount/100).toFixed(2)} one-time | $${(pW.unit_amount/100).toFixed(2)}/week | $${(pM.unit_amount/100).toFixed(2)}/month`);
      }

      // 5×5 rules (premium "rounder")
      if (sizes.includes("5x5")) {
        const ov = PRICING.overrides_5x5[slug] || PRICING["5x5"];
        const pOne5 = await ensurePrice({
          productId: product.id,
          lookup_key: `${slug}:5x5:one_time:usd`,
          unit_amount: ov.one_time_cents,
          type: "one_time",
          nickname: "One-time (5×5)",
        });
        const pW5 = await ensurePrice({
          productId: product.id,
          lookup_key: `${slug}:5x5:weekly:usd`,
          unit_amount: ov.weekly_cents,
          type: "recurring",
          interval: "week",
          nickname: "Weekly subscription (5×5)",
        });

        // If product does NOT have 10×20, make 5×5 the default
        if (!sizes.includes("10x20")) {
          await setDefaultPrice(product.id, pOne5.id);
        }
        console.log(`✓ ${name} (5×5) → $${(pOne5.unit_amount/100).toFixed(2)} one-time | $${(pW5.unit_amount/100).toFixed(2)}/week`);
      }
    }

    // 2) Bundles
    console.log("\nCreating bundles…");
    for (const b of BUNDLES) {
      const missing = b.contents.filter(id => !byId[id]);
      if (missing.length) {
        console.warn(`! Skipping "${b.slug}" — missing items in JSON: ${missing.join(", ")}`);
        continue;
      }

      const prod = await upsertProduct({
        name: b.name,
        slug: b.slug,
        description: b.description,
        metadata: { slug: b.slug, kind: "bundle", contents: JSON.stringify(b.contents) },
      });

      if (b.prices.one_time_cents) {
        const p = await ensurePrice({
          productId: prod.id,
          lookup_key: `${b.slug}:bundle:one_time:usd`,
          unit_amount: b.prices.one_time_cents,
          type: "one_time",
          nickname: "Bundle (one-time)",
        });
        await setDefaultPrice(prod.id, p.id);
      }
      if (b.prices.weekly_cents) {
        await ensurePrice({
          productId: prod.id,
          lookup_key: `${b.slug}:bundle:weekly:usd`,
          unit_amount: b.prices.weekly_cents,
          type: "recurring",
          interval: "week",
          nickname: "Bundle (weekly subscription)",
        });
      }
      if (b.prices.monthly_cents) {
        await ensurePrice({
          productId: prod.id,
          lookup_key: `${b.slug}:bundle:monthly:usd`,
          unit_amount: b.prices.monthly_cents,
          type: "recurring",
          interval: "month",
          nickname: "Bundle (monthly subscription)",
        });
      }

      console.log(`✓ Bundle created: ${b.name}`);
    }

    console.log("\nAll done! 🎉  Prices can be referenced by lookup_key, e.g.:");
    console.log("  - broccoli-live-tray:10x20:weekly:usd");
    console.log("  - amaranth-red-5x5:5x5:one_time:usd");
    console.log("  - bundle-core-4pack:bundle:monthly:usd");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

/* ---------- Utils ---------- */

function displayName(crop) {
  // Example: "Black Oil Sunflower — Live Tray" or "Shiso (Perilla Korean) — 5×5"
  const has1020 = (crop.tray_sizes || []).includes("10x20");
  const has5x5 = (crop.tray_sizes || []).includes("5x5");
  if (has1020 && !has5x5) return `${crop.name} — Live Tray`;
  if (!has1020 && has5x5) return `${crop.name} — 5×5`;
  // both sizes (e.g., Amaranth has both)
  return `${crop.name}`;
}

function describe(crop) {
  const flavor = crop.flavor?.notes ? `Flavor: ${crop.flavor.notes}. ` : "";
  const cat = crop.category?.replace(/-/g, " ") || "core";
  const sizes = (crop.tray_sizes || []).join(", ");
  return `${flavor}Category: ${cat}. Sizes: ${sizes}.`;
}

