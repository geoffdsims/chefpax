import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getProductsWithInventory } from "@/lib/inventory";
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
    
    // Calculate real-time availability
    const productsWithAvailability = await Promise.all(products.map(async (product) => {
      // Get orders for current week that include this product
      const orders = await db.collection("orders").find({
        "cart.productId": product._id.toString(),
        status: { $in: ["paid", "confirmed", "processing"] },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }).toArray();
      
      // Calculate sold quantity
      const soldQty = orders.reduce((total, order) => {
        const cartItem = order.cart?.find((item: any) => item.productId === product._id.toString());
        return total + (cartItem?.qty || 0);
      }, 0);
      
      // Calculate available
      const weeklyCapacity = product.weeklyCapacity || 0;
      const available = Math.max(0, weeklyCapacity - soldQty);
      
      return {
        ...product,
        currentWeekAvailable: available,
        soldThisWeek: soldQty
      };
    }));
    
    return NextResponse.json(productsWithAvailability);
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
