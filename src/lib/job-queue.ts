/**
 * ChefPax Job Queue System
 * Handles production tasks, delivery jobs, and automation workflows
 */

import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { automationEngine } from './automation-engine';
import type { ProductionTask, DeliveryJob, AutomationJob } from './schema-automation';

// Redis connection
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// Job queues
export const productionQueue = new Queue('production', { connection: redis });
export const deliveryQueue = new Queue('delivery', { connection: redis });
export const notificationQueue = new Queue('notifications', { connection: redis });
export const automationQueue = new Queue('automation', { connection: redis });

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
export const productionWorker = new Worker('production', async (job: Job<ProductionJobData>) => {
  const { taskId, type, productId, quantity, orderId, subscriptionId } = job.data;
  
  console.log(`🌱 Processing production job: ${type} for ${quantity} units of ${productId}`);
  
  try {
    // Simulate production task execution
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    
    // Mark task as completed
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
}, { connection: redis });

// Delivery job processor
export const deliveryWorker = new Worker('delivery', async (job: Job<DeliveryJobData>) => {
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
}, { connection: redis });

// Notification job processor
export const notificationWorker = new Worker('notifications', async (job: Job<NotificationJobData>) => {
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
}, { connection: redis });

// Automation job processor
export const automationWorker = new Worker('automation', async (job: Job<AutomationJobData>) => {
  const { type, payload } = job.data;
  
  console.log(`🤖 Processing automation job: ${type}`);
  
  try {
    switch (type) {
      case 'subscription_cycle':
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
}, { connection: redis });

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
  // Simulate courier request
  console.log(`🚚 Requesting courier pickup for ${deliveryJobId}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update delivery job status
  await automationEngine.updateDeliveryJobStatus(deliveryJobId, 'SCHEDULED', {
    trackingNumber: `TRK${Date.now().toString().slice(-8)}`,
    eta: new Date(scheduledFor).toISOString()
  });
}

async function updateDeliveryStatus(deliveryJobId: string, status: string) {
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
  await notificationQueue.add('notification', notification);
}

export async function addAutomationJob(automation: AutomationJobData) {
  await automationQueue.add('automation', automation);
}

// Graceful shutdown
export async function closeQueues() {
  await Promise.all([
    productionQueue.close(),
    deliveryQueue.close(),
    notificationQueue.close(),
    automationQueue.close(),
    productionWorker.close(),
    deliveryWorker.close(),
    notificationWorker.close(),
    automationWorker.close(),
    redis.disconnect()
  ]);
}
