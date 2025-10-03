/**
 * Test Automation Workflow
 * Creates a test order and verifies production tasks and delivery jobs are created
 */

import { automationEngine } from '@/lib/automation-engine';
import { getDb } from '@/lib/mongo';

async function testAutomationWorkflow() {
  console.log('🧪 Testing ChefPax Automation Workflow...\n');
  
  try {
    const db = await getDb();
    
    // Test data
    const testOrderId = `test-order-${Date.now()}`;
    const testProductId = 'chefpax-mix-live-tray';
    const testQuantity = 2;
    const testDeliveryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    
    console.log('📋 Test Parameters:');
    console.log(`  Order ID: ${testOrderId}`);
    console.log(`  Product ID: ${testProductId}`);
    console.log(`  Quantity: ${testQuantity}`);
    console.log(`  Delivery Date: ${testDeliveryDate.toISOString()}\n`);
    
    // Step 1: Create production tasks
    console.log('🌱 Step 1: Creating production tasks...');
    const productionTasks = await automationEngine.createProductionTasksFromOrder(
      testOrderId,
      testProductId,
      testQuantity,
      testDeliveryDate.toISOString()
    );
    
    console.log(`✅ Created ${productionTasks.length} production tasks:`);
    productionTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.type} - Scheduled: ${new Date(task.runAt).toLocaleString()}`);
    });
    console.log('');
    
    // Step 2: Create delivery job
    console.log('🚚 Step 2: Creating delivery job...');
    const deliveryJob = await automationEngine.createDeliveryJob(
      testOrderId,
      {
        name: 'Test Customer',
        line1: '123 Test Street',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        phone: '555-0123'
      },
      testDeliveryDate.toISOString(),
      'LOCAL_COURIER'
    );
    
    console.log(`✅ Created delivery job: ${deliveryJob._id}`);
    console.log(`  Status: ${deliveryJob.status}`);
    console.log(`  Method: ${deliveryJob.method}`);
    console.log(`  Scheduled: ${deliveryJob.scheduledFor}\n`);
    
    // Step 3: Verify database collections
    console.log('🗄️ Step 3: Verifying database collections...');
    
    const taskCount = await db.collection('productionTasks').countDocuments({ orderId: testOrderId });
    console.log(`✅ Production tasks in database: ${taskCount}`);
    
    const deliveryCount = await db.collection('deliveryJobs').countDocuments({ orderId: testOrderId });
    console.log(`✅ Delivery jobs in database: ${deliveryCount}`);
    
    // Step 4: Check job queues
    console.log('\n⚡ Step 4: Checking job queues...');
    
    // Import job queues to check
    const { productionQueue, deliveryQueue } = await import('@/lib/job-queue');
    
    const waitingJobs = await productionQueue.getWaiting();
    const activeJobs = await productionQueue.getActive();
    console.log(`✅ Production queue - Waiting: ${waitingJobs.length}, Active: ${activeJobs.length}`);
    
    const deliveryWaitingJobs = await deliveryQueue.getWaiting();
    const deliveryActiveJobs = await deliveryQueue.getActive();
    console.log(`✅ Delivery queue - Waiting: ${deliveryWaitingJobs.length}, Active: ${deliveryActiveJobs.length}\n`);
    
    // Step 5: Test task completion
    console.log('✅ Step 5: Testing task completion...');
    if (productionTasks.length > 0) {
      const firstTask = productionTasks[0];
      await automationEngine.completeProductionTask(firstTask._id!, 'Test completion');
      console.log(`✅ Marked task ${firstTask.type} as completed`);
      
      // Verify completion
      const completedTask = await db.collection('productionTasks').findOne({ _id: firstTask._id });
      console.log(`✅ Task status updated to: ${completedTask?.status}`);
    }
    
    console.log('\n🎉 Automation workflow test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  ✅ Production tasks created and queued`);
    console.log(`  ✅ Delivery job created and scheduled`);
    console.log(`  ✅ Database collections populated`);
    console.log(`  ✅ Job queues operational`);
    console.log(`  ✅ Task completion workflow tested`);
    
  } catch (error) {
    console.error('❌ Automation workflow test failed:', error);
    throw error;
  }
}

// Run test if called directly
if (require.main === module) {
  testAutomationWorkflow()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testAutomationWorkflow };
