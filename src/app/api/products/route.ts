import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getProductsWithInventory } from "@/lib/inventory";
import { checkAvailability } from "@/lib/inventory-reservation";
import type { Product } from "@/lib/schema";

export async function GET() {
  try {
    const db = await getDb();
    
    // Get products from MongoDB
    const products = await db.collection("products").find({ active: true }).sort({ sort: 1 }).toArray();
    
    if (products.length === 0) {
      // Fallback to hardcoded products if database is empty
      console.warn("No products in database, using hardcoded catalog");
      return NextResponse.json(getProductsWithInventory());
    }
    
    // Return products with their static capacity (real-time availability calculation causes timeouts)
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    // Fallback to hardcoded if database fails
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
