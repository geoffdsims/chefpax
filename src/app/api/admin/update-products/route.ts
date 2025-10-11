import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getProductsWithInventory } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

/**
 * Admin endpoint to update product catalog in MongoDB
 * This replaces all products with the latest from inventory.ts
 */
export async function POST() {
  try {
    const db = await getDb();
    
    // Get the latest product definitions from code
    const products = getProductsWithInventory();
    
    // Delete all existing products
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old products`);
    
    // Insert new products
    const insertResult = await db.collection('products').insertMany(products as any);
    console.log(`Inserted ${insertResult.insertedCount} new products`);
    
    return NextResponse.json({
      success: true,
      message: 'Products updated successfully',
      deleted: deleteResult.deletedCount,
      inserted: insertResult.insertedCount,
      products: products.map(p => ({ id: p._id, name: p.name, sku: p.sku }))
    });
  } catch (error: any) {
    console.error('Error updating products:', error);
    return NextResponse.json({
      error: 'Failed to update products',
      message: error.message
    }, { status: 500 });
  }
}

