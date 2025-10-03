/**
 * Database Initialization Script
 * Sets up collections and indexes for the automation system
 */

import { getDb } from './mongo';

export async function initializeDatabase() {
  try {
    const db = await getDb();
    
    console.log('🗄️ Initializing ChefPax database collections...');
    
    // Create productionTasks collection with indexes
    await db.createCollection('productionTasks');
    await db.collection('productionTasks').createIndex({ runAt: 1 });
    await db.collection('productionTasks').createIndex({ status: 1 });
    await db.collection('productionTasks').createIndex({ priority: 1 });
    await db.collection('productionTasks').createIndex({ productId: 1 });
    await db.collection('productionTasks').createIndex({ orderId: 1 });
    await db.collection('productionTasks').createIndex({ subscriptionId: 1 });
    console.log('✅ Created productionTasks collection with indexes');
    
    // Create deliveryJobs collection with indexes
    await db.createCollection('deliveryJobs');
    await db.collection('deliveryJobs').createIndex({ orderId: 1 });
    await db.collection('deliveryJobs').createIndex({ status: 1 });
    await db.collection('deliveryJobs').createIndex({ scheduledFor: 1 });
    await db.collection('deliveryJobs').createIndex({ trackingNumber: 1 });
    console.log('✅ Created deliveryJobs collection with indexes');
    
    // Create automationJobs collection with indexes
    await db.createCollection('automationJobs');
    await db.collection('automationJobs').createIndex({ type: 1 });
    await db.collection('automationJobs').createIndex({ status: 1 });
    await db.collection('automationJobs').createIndex({ scheduledFor: 1 });
    await db.collection('automationJobs').createIndex({ createdAt: 1 });
    console.log('✅ Created automationJobs collection with indexes');
    
    // Create enhanced subscriptions collection with indexes
    await db.createCollection('enhancedSubscriptions');
    await db.collection('enhancedSubscriptions').createIndex({ customerId: 1 });
    await db.collection('enhancedSubscriptions').createIndex({ userId: 1 });
    await db.collection('enhancedSubscriptions').createIndex({ status: 1 });
    await db.collection('enhancedSubscriptions').createIndex({ nextCycleAt: 1 });
    await db.collection('enhancedSubscriptions').createIndex({ 'stripe.subscriptionId': 1 });
    console.log('✅ Created enhancedSubscriptions collection with indexes');
    
    // Create inventoryAlerts collection with indexes
    await db.createCollection('inventoryAlerts');
    await db.collection('inventoryAlerts').createIndex({ type: 1 });
    await db.collection('inventoryAlerts').createIndex({ status: 1 });
    await db.collection('inventoryAlerts').createIndex({ productId: 1 });
    await db.collection('inventoryAlerts').createIndex({ createdAt: 1 });
    console.log('✅ Created inventoryAlerts collection with indexes');
    
    // Create marketingCampaigns collection with indexes
    await db.createCollection('marketingCampaigns');
    await db.collection('marketingCampaigns').createIndex({ type: 1 });
    await db.collection('marketingCampaigns').createIndex({ status: 1 });
    await db.collection('marketingCampaigns').createIndex({ 'audience.segment': 1 });
    await db.collection('marketingCampaigns').createIndex({ createdAt: 1 });
    console.log('✅ Created marketingCampaigns collection with indexes');
    
    // Create businessMetrics collection with indexes
    await db.createCollection('businessMetrics');
    await db.collection('businessMetrics').createIndex({ date: 1 });
    await db.collection('businessMetrics').createIndex({ period: 1 });
    await db.collection('businessMetrics').createIndex({ createdAt: 1 });
    console.log('✅ Created businessMetrics collection with indexes');
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Auto-initialize if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}
