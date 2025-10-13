/**
 * Create MongoDB indexes for performance optimization
 * Run this script once to set up all necessary indexes
 * 
 * Usage: node scripts/create-db-indexes.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Products collection
    console.log('\n📦 Creating indexes for products collection...');
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ varietyGroup: 1, sizeOz: 1 });
    await db.collection('products').createIndex({ availableForSubscription: 1 });
    console.log('✅ Products indexes created');
    
    // Orders collection
    console.log('\n🛒 Creating indexes for orders collection...');
    await db.collection('orders').createIndex({ email: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1, deliveryDate: 1 });
    await db.collection('orders').createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true });
    await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ createdAt: -1 }); // For recent orders
    console.log('✅ Orders indexes created');
    
    // Production Tasks collection
    console.log('\n🌱 Creating indexes for productionTasks collection...');
    await db.collection('productionTasks').createIndex({ status: 1, runAt: 1 });
    await db.collection('productionTasks').createIndex({ orderId: 1 });
    await db.collection('productionTasks').createIndex({ type: 1, status: 1 });
    await db.collection('productionTasks').createIndex({ productId: 1, runAt: 1 });
    await db.collection('productionTasks').createIndex({ runAt: 1 }); // For task scheduling
    console.log('✅ Production tasks indexes created');
    
    // Subscriptions collection
    console.log('\n📅 Creating indexes for subscriptions collection...');
    await db.collection('subscriptions').createIndex({ userId: 1, status: 1 });
    await db.collection('subscriptions').createIndex({ stripeSubscriptionId: 1 }, { unique: true, sparse: true });
    await db.collection('subscriptions').createIndex({ status: 1, nextDeliveryDate: 1 });
    await db.collection('subscriptions').createIndex({ createdAt: -1 });
    console.log('✅ Subscriptions indexes created');
    
    // Users collection (NextAuth)
    console.log('\n👤 Creating indexes for users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: -1 });
    console.log('✅ Users indexes created');
    
    // Sessions collection (NextAuth)
    console.log('\n🔐 Creating indexes for sessions collection...');
    await db.collection('sessions').createIndex({ sessionToken: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 }); // TTL index
    console.log('✅ Sessions indexes created');
    
    // Accounts collection (NextAuth)
    console.log('\n🔗 Creating indexes for accounts collection...');
    await db.collection('accounts').createIndex({ userId: 1 });
    await db.collection('accounts').createIndex({ provider: 1, providerAccountId: 1 }, { unique: true });
    console.log('✅ Accounts indexes created');
    
    // Inventory Reservations collection
    console.log('\n📊 Creating indexes for inventoryReservations collection...');
    await db.collection('inventoryReservations').createIndex({ productId: 1, deliveryDate: 1 });
    await db.collection('inventoryReservations').createIndex({ orderId: 1 });
    await db.collection('inventoryReservations').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
    console.log('✅ Inventory reservations indexes created');
    
    // IoT Sensor Readings collection (future)
    console.log('\n🌡️ Creating indexes for sensorReadings collection...');
    await db.collection('sensorReadings').createIndex({ timestamp: -1 });
    await db.collection('sensorReadings').createIndex({ sensorType: 1, timestamp: -1 });
    await db.collection('sensorReadings').createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // Expire after 90 days
    console.log('✅ Sensor readings indexes created');
    
    // List all indexes
    console.log('\n📋 Summary of all indexes:');
    const collections = ['products', 'orders', 'productionTasks', 'subscriptions', 'users', 'sessions', 'accounts', 'inventoryReservations', 'sensorReadings'];
    
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`\n${collectionName} (${indexes.length} indexes):`);
      indexes.forEach(index => {
        const keys = Object.keys(index.key).map(k => `${k}: ${index.key[k]}`).join(', ');
        const unique = index.unique ? ' [UNIQUE]' : '';
        const ttl = index.expireAfterSeconds !== undefined ? ` [TTL: ${index.expireAfterSeconds}s]` : '';
        console.log(`  - { ${keys} }${unique}${ttl}`);
      });
    }
    
    console.log('\n✅ All indexes created successfully!');
    console.log('\n💡 Tip: Run this script again if you add new collections or need to update indexes.');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes();

