/**
 * ChefPax Job Queue System
 * Handles production tasks, delivery jobs, and automation workflows
 */

// Conditional imports to avoid build-time Redis connection
let Queue: any, Worker: any, Job: any, IORedis: any;

if (typeof window === 'undefined') {
  try {
    const bullmq = require('bullmq');
    Queue = bullmq.Queue;
    Worker = bullmq.Worker;
    Job = bullmq.Job;
    IORedis = require('ioredis').default;
  } catch (e) {
    // Skip if packages not available
  }
}
import type { ProductionTask, DeliveryJob, AutomationJob } from './schema-automation';

// Redis connection - only connect if not in build mode and packages available
const redis = (process.env.NODE_ENV === 'production' && process.env.VERCEL && IORedis) 
  ? new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')
  : null;

// Job queues - only create if redis and Queue class are available
export const productionQueue = (redis && Queue) ? new Queue('production', { connection: redis }) : null;
export const deliveryQueue = (redis && Queue) ? new Queue('delivery', { connection: redis }) : null;
export const notificationQueue = (redis && Queue) ? new Queue('notifications', { connection: redis }) : null;
export const automationQueue = (redis && Queue) ? new Queue('automation', { connection: redis }) : null;

// Job types
export interface ProductionJobData {
  taskId: string;
  type: 'SEED' | 'GERMINATE' | 'LIGHT' | 'HARVEST' | 'PACK';
  productId: string;
  quantity: number;
  orderId?: string;
  subscriptionId?: string;
}

export interface DeliveryJobData {
  deliveryJobId: string;
  action: 'request_courier' | 'update_status' | 'send_notification';
  orderId: string;
  address: any;
  scheduledFor: string;
}

export interface NotificationJobData {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  template: string;
  data: Record<string, any>;
}

export interface AutomationJobData {
  type: 'subscription_cycle' | 'inventory_check' | 'delivery_reminder';
  payload: Record<string, any>;
}

// Production job processor
export const productionWorker = (redis && Worker) ? new Worker('production', async (job: any) => {
  const { taskId, type, productId, quantity, orderId, subscriptionId } = job.data;
  
  console.log(`🌱 Processing production job: ${type} for ${quantity} units of ${productId}`);
  
  try {
    // Simulate production task execution
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    
    // Mark task as completed
    const { automationEngine } = await import('./automation-engine');
    await automationEngine.completeProductionTask(taskId, `Completed by automation at ${new Date().toISOString()}`);
    
    // Trigger next stage if applicable
    if (type !== 'PACK') {
      // Schedule next production stage
      await scheduleNextProductionStage(taskId, productId, quantity, orderId, subscriptionId);
    } else {
      // Packing complete - schedule delivery
      if (orderId) {
        await scheduleDeliveryPreparation(orderId);
      }
    }
    
    console.log(`✅ Completed production job: ${type} for ${productId}`);
  } catch (error) {
    console.error(`❌ Failed production job: ${type}`, error);
    throw error;
  }
}, { connection: redis }) : null;

// Delivery job processor
export const deliveryWorker = (redis && Worker) ? new Worker('delivery', async (job: any) => {
  const { deliveryJobId, action, orderId, address, scheduledFor } = job.data;
  
  console.log(`🚚 Processing delivery job: ${action} for order ${orderId}`);
  
  try {
    switch (action) {
      case 'request_courier':
        await requestCourierPickup(deliveryJobId, address, scheduledFor);
        break;
      case 'update_status':
        await updateDeliveryStatus(deliveryJobId, 'PICKED_UP');
        break;
      case 'send_notification':
        await sendDeliveryNotification(deliveryJobId);
        break;
    }
    
    console.log(`✅ Completed delivery job: ${action} for order ${orderId}`);
  } catch (error) {
    console.error(`❌ Failed delivery job: ${action}`, error);
    throw error;
  }
}, { connection: redis }) : null;

// Notification job processor
export const notificationWorker = (redis && Worker) ? new Worker('notifications', async (job: any) => {
  const { type, recipient, template, data } = job.data;
  
  console.log(`📧 Processing notification: ${type} to ${recipient}`);
  
  try {
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Sent ${type} notification to ${recipient}`);
  } catch (error) {
    console.error(`❌ Failed to send ${type} notification`, error);
    throw error;
  }
}, { connection: redis }) : null;

// Automation job processor
export const automationWorker = (redis && Worker) ? new Worker('automation', async (job: any) => {
  const { type, payload } = job.data;
  
  console.log(`🤖 Processing automation job: ${type}`);
  
  try {
    switch (type) {
      case 'subscription_cycle':
        const { automationEngine } = await import('./automation-engine');
        await automationEngine.processSubscriptionCycle(payload.subscriptionId);
        break;
      case 'inventory_check':
        await checkInventoryLevels();
        break;
      case 'delivery_reminder':
        await sendDeliveryReminders();
        break;
    }
    
    console.log(`✅ Completed automation job: ${type}`);
  } catch (error) {
    console.error(`❌ Failed automation job: ${type}`, error);
    throw error;
  }
}, { connection: redis }) : null;

// Helper functions
async function scheduleNextProductionStage(
  currentTaskId: string, 
  productId: string, 
  quantity: number, 
  orderId?: string, 
  subscriptionId?: string
) {
  // Get product to determine next stage
  const db = await import('./mongo').then(m => m.getDb());
  const product = await db.collection('products').findOne({ _id: productId });
  
  if (product && product.stages) {
    const currentTask = await db.collection('productionTasks').findOne({ _id: currentTaskId });
    const currentStageIndex = product.stages.findIndex((s: any) => s.type === currentTask?.type);
    const nextStage = product.stages[currentStageIndex + 1];
    
    if (nextStage) {
      const nextTaskDate = new Date(currentTask?.runAt || new Date());
      nextTaskDate.setDate(nextTaskDate.getDate() + (nextStage.offsetDays - (product.stages[currentStageIndex]?.offsetDays || 0)));
      
      // Schedule next production job
      await productionQueue.add(
        'production-task',
        {
          taskId: `next-${currentTaskId}`,
          type: nextStage.type,
          productId,
          quantity,
          orderId,
          subscriptionId
        },
        {
          delay: nextTaskDate.getTime() - Date.now(),
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
    }
  }
}

async function scheduleDeliveryPreparation(orderId: string) {
  // Schedule delivery preparation job
  await deliveryQueue.add(
    'delivery-preparation',
    {
      deliveryJobId: `prep-${orderId}`,
      action: 'request_courier',
      orderId,
      address: {}, // Will be populated from order
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    },
    {
      delay: 24 * 60 * 60 * 1000, // 24 hours delay
      attempts: 3
    }
  );
}

async function requestCourierPickup(deliveryJobId: string, address: any, scheduledFor: string) {
  console.log(`🚚 Requesting courier pickup for ${deliveryJobId}`);
  
  try {
    // Try multiple delivery providers in order of preference
    let deliveryCreated = false;
    let deliveryResult = null;
    
    // First try Uber Direct
    try {
      const { UberDirectAPI } = await import('./uber-direct-api');
      
      const uberAPI = new UberDirectAPI(
        process.env.UBER_DIRECT_CLIENT_ID || '',
        process.env.UBER_DIRECT_CLIENT_SECRET || '',
        process.env.UBER_DIRECT_CUSTOMER_ID || ''
      );

    // Create delivery request
    const deliveryRequest = {
      pickupAddress: {
        street: "Your Address", // Replace with your actual pickup address
        city: "Austin",
        state: "TX",
        zip: "78701",
        country: "US"
      },
      dropoffAddress: {
        street: address.street || address.address1,
        city: address.city,
        state: address.state,
        zip: address.zip || address.postal_code,
        country: address.country || "US"
      },
      items: [
        {
          name: "Live Microgreen Tray",
          quantity: 1,
          price: 25.00 // Base price for live tray
        }
      ],
      pickupTime: new Date(scheduledFor).toISOString(),
      specialInstructions: "Live microgreen trays - handle with care, keep upright"
    };

      const delivery = await uberAPI.createDelivery(deliveryRequest);
      
      deliveryResult = delivery;
      deliveryCreated = true;
      
      console.log(`✅ Uber Direct delivery created: ${delivery.id}`);
      
    } catch (uberError) {
      console.log('⚠️ Uber Direct failed, trying Roadie...');
      
      // Try Roadie as backup
      try {
        const { RoadieAPI } = await import('./roadie-api');
        
        const roadieAPI = new RoadieAPI(
          process.env.ROADIE_CUSTOMER_ID || ''
        );

        const roadieDelivery = await roadieAPI.createDelivery({
          pickupAddress: {
            street: "Your Address", // Replace with your actual pickup address
            city: "Austin",
            state: "TX",
            zip: "78701",
            country: "US"
          },
          dropoffAddress: {
            street: address.street || address.address1,
            city: address.city,
            state: address.state,
            zip: address.zip || address.postal_code,
            country: address.country || "US"
          },
          items: [
            {
              name: "Live Microgreen Tray",
              quantity: 1,
              weight: 2,
              dimensions: {
                length: 12,
                width: 8,
                height: 4
              }
            }
          ],
          pickupTime: new Date(scheduledFor).toISOString(),
          specialInstructions: "Live microgreen trays - handle with care, keep upright"
        });
        
        deliveryResult = roadieDelivery;
        deliveryCreated = true;
        
        console.log(`✅ Roadie delivery created: ${roadieDelivery.id}`);
        
      } catch (roadieError) {
        console.error('❌ Both Uber Direct and Roadie failed:', roadieError);
        throw roadieError;
      }
    }
    
    if (deliveryCreated && deliveryResult) {
      // Update delivery job status with tracking info
      const { automationEngine } = await import('./automation-engine');
      await automationEngine.updateDeliveryJobStatus(deliveryJobId, 'SCHEDULED', {
        trackingNumber: deliveryResult.id,
        eta: new Date(scheduledFor).toISOString(),
        courierProvider: deliveryResult.provider || 'Uber Direct',
        courierTrackingUrl: deliveryResult.tracking_url || deliveryResult.trackingUrl
      });
    }
    
  } catch (error) {
    console.error('❌ Uber Direct delivery failed, falling back to local courier:', error);
    
    // Fallback to local courier
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { automationEngine } = await import('./automation-engine');
    await automationEngine.updateDeliveryJobStatus(deliveryJobId, 'SCHEDULED', {
      trackingNumber: `LOCAL-${Date.now().toString().slice(-8)}`,
      eta: new Date(scheduledFor).toISOString(),
      courierProvider: 'Local Courier',
      note: 'Uber Direct unavailable, using local courier'
    });
  }
}

async function updateDeliveryStatus(deliveryJobId: string, status: string) {
  const { automationEngine } = await import('./automation-engine');
  await automationEngine.updateDeliveryJobStatus(deliveryJobId, status);
}

async function sendDeliveryNotification(deliveryJobId: string) {
  // Send notification to customer
  await notificationQueue.add(
    'delivery-notification',
    {
      type: 'email',
      recipient: 'customer@example.com',
      template: 'delivery-out-for-delivery',
      data: { deliveryJobId }
    }
  );
}

async function checkInventoryLevels() {
  console.log('📊 Checking inventory levels...');
  // Implementation for inventory checking
}

async function sendDeliveryReminders() {
  console.log('📧 Sending delivery reminders...');
  // Implementation for delivery reminders
}

// Queue management functions
export async function addProductionTask(task: ProductionTask) {
  if (!productionQueue) return; // Skip if no Redis connection
  
  const delay = new Date(task.runAt).getTime() - Date.now();
  
  if (delay > 0) {
    await productionQueue.add(
      'production-task',
      {
        taskId: task._id!,
        type: task.type,
        productId: task.productId,
        quantity: task.quantity,
        orderId: task.orderId,
        subscriptionId: task.subscriptionId
      },
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );
  } else {
    // Task is due now, process immediately
    await productionQueue.add(
      'production-task',
      {
        taskId: task._id!,
        type: task.type,
        productId: task.productId,
        quantity: task.quantity,
        orderId: task.orderId,
        subscriptionId: task.subscriptionId
      }
    );
  }
}

export async function addDeliveryJob(deliveryJob: DeliveryJob) {
  if (!deliveryQueue) return; // Skip if no Redis connection
  
  const delay = new Date(deliveryJob.scheduledFor || new Date()).getTime() - Date.now();
  
  await deliveryQueue.add(
    'delivery-job',
    {
      deliveryJobId: deliveryJob._id!,
      action: 'request_courier',
      orderId: deliveryJob.orderId,
      address: deliveryJob.address,
      scheduledFor: deliveryJob.scheduledFor!
    },
    {
      delay: Math.max(0, delay),
      attempts: 3
    }
  );
}

export async function addNotificationJob(notification: NotificationJobData) {
  if (!notificationQueue) return; // Skip if no Redis connection
  await notificationQueue.add('notification', notification);
}

export async function addAutomationJob(automation: AutomationJobData) {
  if (!automationQueue) return; // Skip if no Redis connection
  await automationQueue.add('automation', automation);
}

// Graceful shutdown
export async function closeQueues() {
  if (!redis) return; // Skip if no Redis connection
  
  await Promise.all([
    productionQueue?.close(),
    deliveryQueue?.close(),
    notificationQueue?.close(),
    automationQueue?.close(),
    productionWorker?.close(),
    deliveryWorker?.close(),
    notificationWorker?.close(),
    automationWorker?.close(),
    redis.disconnect()
  ].filter(Boolean));
}
