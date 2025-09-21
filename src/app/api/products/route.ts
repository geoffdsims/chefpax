import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getProductsWithInventory } from "@/lib/inventory";
import type { Product } from "@/lib/schema";

export async function GET() {
  try {
    const db = await getDb();
    const products = await db.collection<Product>("products")
      .find({ active: true })
      .sort({ sort: 1 })
      .toArray();
    
    // If no products in DB, return calculated inventory
    if (products.length === 0) {
      return NextResponse.json(getProductsWithInventory());
    }
    
    return NextResponse.json(products);
  } catch (error) {
    // Fallback to calculated inventory if DB fails
    console.error("Database error, using calculated inventory:", error);
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
