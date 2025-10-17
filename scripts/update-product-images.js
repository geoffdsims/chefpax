#!/usr/bin/env node

/**
 * Update product image paths in MongoDB to match new microgreens folder structure
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI environment variable not set');
  process.exit(1);
}

const imageMap = {
  '/images/sunflower.png': '/images/microgeens/subflower_10x20.png',
  '/images/pea_shoots.png': '/images/microgeens/peas_10x20.png',
  '/images/radish_saxa2.png': '/images/microgeens/radish_rambo_10x20.png',
  '/images/broccoli.png': '/images/microgeens/brocolli_10x20.png',
  '/images/kohlrabi.png': '/images/microgeens/kohlrabi_purple_vienna_10x20.png',
  '/images/superfood_mix.png': '/images/microgeens/super_mix_.png',
  '/images/wasabi_mustard.png': '/images/microgeens/wasabi_mustard_10x20.png',
  '/images/amaranth_dreads.png': '/images/microgeens/amaranth_red_5x5.png',
  '/images/basil_dark_opal.png': '/images/microgeens/basil_dark_opal_5x5.png',
  '/images/basil_lemon.png': '/images/microgeens/basil_lemon_5x5.png',
  '/images/basil_thai.png': '/images/microgeens/basil_thai_5x5.png',
  '/images/shiso.png': '/images/microgeens/shiso_perilla.png',
};

async function updateProductImages() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'chefpax');
    const products = db.collection('products');
    
    let updatedCount = 0;
    
    // Update each product with matching old photoUrl
    for (const [oldPath, newPath] of Object.entries(imageMap)) {
      const result = await products.updateMany(
        { photoUrl: oldPath },
        { $set: { photoUrl: newPath } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${result.modifiedCount} product(s): ${oldPath} → ${newPath}`);
        updatedCount += result.modifiedCount;
      }
    }
    
    // Special case: update 5x5 wasabi mustard separately
    const wasabiResult = await products.updateOne(
      { 
        sku: 'WASABI_MUSTARD_5X5',
        photoUrl: '/images/microgeens/wasabi_mustard_10x20.png'
      },
      { $set: { photoUrl: '/images/microgeens/wasabi_mustard_5x5.png' } }
    );
    
    if (wasabiResult.modifiedCount > 0) {
      console.log(`✅ Updated 5x5 Wasabi Mustard image`);
      updatedCount += wasabiResult.modifiedCount;
    }
    
    console.log(`\n✅ Total products updated: ${updatedCount}`);
    
    // Show current image paths
    console.log('\n📸 Current product images:');
    const allProducts = await products.find({ active: true }).sort({ sort: 1 }).toArray();
    allProducts.forEach(p => {
      console.log(`  ${p.name}: ${p.photoUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

updateProductImages();


