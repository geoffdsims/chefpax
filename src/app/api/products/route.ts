import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getProductsWithInventory } from "@/lib/inventory";
import { batchCalculateAvailability } from "@/lib/availability-cache";
import type { Product } from "@/lib/schema";

export async function GET() {
  try {
    const db = await getDb();
    
    if (!db) {
      console.warn("Database not available, using hardcoded catalog");
      return NextResponse.json(getProductsWithInventory());
    }
    
    // Get products from MongoDB
    const products = await db.collection("products").find({ active: true }).sort({ sort: 1 }).toArray();
    
    if (!products || products.length === 0) {
      console.warn("No products in database, using hardcoded catalog");
      return NextResponse.json(getProductsWithInventory());
    }
    
    // Return products as-is from MongoDB (they already have currentWeekAvailable set)
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    // Fallback to hardcoded if database fails or times out
    return NextResponse.json(getProductsWithInventory());
  }
}

// Optional: quick seed via POST (run once, then disable)
export async function POST() {
  try {
    const db = await getDb();
    const count = await db.collection("products").countDocuments();
    if (count > 0) return NextResponse.json({ ok: true, message: "Already seeded." });

    const docs = getProductsWithInventory();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection("products").insertMany(docs as any);
    return NextResponse.json({ ok: true, inserted: docs.length });
  } catch (error) {
    console.error("Error seeding products:", error);
    return NextResponse.json({ error: "Failed to seed products" }, { status: 500 });
  }
}
