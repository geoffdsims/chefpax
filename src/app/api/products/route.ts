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
    
    // Calculate real-time availability using reservation system
    const productsWithAvailability = await Promise.all(products.map(async (product) => {
      try {
        // Determine tray size from product data
        const traySize = (product.sizeOz && product.sizeOz < 50) ? '5x5' : '10x20';
        
        // Get next delivery date (simplified: 2 days from now)
        const nextDeliveryDate = new Date();
        nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 2);
        
        // Check availability using reservation system
        const availability = await checkAvailability(traySize as '10x20' | '5x5', 1, nextDeliveryDate);
        
        return {
          ...product,
          currentWeekAvailable: availability.availableSlots,
          reservationBased: true,
          rackName: availability.rackName
        };
      } catch (error) {
        console.error(`Error calculating availability for ${product.name}:`, error);
        // Fallback to static capacity if reservation system fails
        return {
          ...product,
          currentWeekAvailable: product.weeklyCapacity || 0,
          reservationBased: false
        };
      }
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
