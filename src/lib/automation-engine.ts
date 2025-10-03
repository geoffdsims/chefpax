/**
 * ChefPax Automation Engine
 * Core system for managing production tasks, deliveries, and subscription cycles
 */

import { getDb } from "./mongo";
import type { 
  ProductionTask, 
  DeliveryJob, 
  EnhancedSubscription, 
  AutomationJob,
  EnhancedProduct,
  SubscriptionItem
} from "./schema-automation";

export class AutomationEngine {
  private db = getDb();

  /**
   * Create production tasks for an order
   */
  async createProductionTasksFromOrder(orderId: string, productId: string, quantity: number, deliveryDate: string): Promise<ProductionTask[]> {
    const db = await this.db;
    
    // Get product details
    const product = await db.collection<EnhancedProduct>("products").findOne({ _id: productId });
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const tasks: ProductionTask[] = [];
    const orderDate = new Date();
    const deliveryDateObj = new Date(deliveryDate);

    // Calculate when to seed based on lead time
    const seedDate = new Date(deliveryDateObj.getTime() - (product.leadTimeDays * 24 * 60 * 60 * 1000));

    // Create tasks for each stage
    for (const stage of product.stages) {
      const taskDate = new Date(seedDate.getTime() + (stage.offsetDays * 24 * 60 * 60 * 1000));
      
      const task: ProductionTask = {
        orderId,
        productId,
        type: stage.type,
        runAt: taskDate.toISOString(),
        status: "PENDING",
        priority: taskDate <= new Date() ? "URGENT" : "MEDIUM",
        notes: `${quantity} trays - ${stage.notes || ''}`,
        quantity,
        labels: stage.type === "PACK" ? [{
          template: "tray",
          payload: {
            sku: product.sku,
            batch: `${taskDate.toISOString().split('T')[0]}-${product.sku}`,
            orderId,
            deliveryDate
          }
        }] : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tasks.push(task);
    }

    // Insert tasks
    await db.collection<ProductionTask>("productionTasks").insertMany(tasks);
    return tasks;
  }

  /**
   * Create production tasks for subscription cycle
   */
  async createProductionTasksFromSubscription(subscriptionId: string, items: SubscriptionItem[], deliveryDate: string): Promise<ProductionTask[]> {
    const allTasks: ProductionTask[] = [];

    for (const item of items) {
      const tasks = await this.createProductionTasksFromOrder(
        `sub-${subscriptionId}`,
        item.productId,
        item.quantity,
        deliveryDate
      );
      
      // Update tasks with subscription ID
      const updatedTasks = tasks.map(task => ({
        ...task,
        orderId: undefined,
        subscriptionId,
        notes: `Subscription ${subscriptionId} - ${task.notes}`
      }));

      allTasks.push(...updatedTasks);
    }

    return allTasks;
  }

  /**
   * Process subscription cycle - create next order and production tasks
   */
  async processSubscriptionCycle(subscriptionId: string): Promise<void> {
    const db = await this.db;
    
    const subscription = await db.collection<EnhancedSubscription>("subscriptions")
      .findOne({ _id: subscriptionId });
    
    if (!subscription || subscription.status !== "active") {
      throw new Error(`Active subscription ${subscriptionId} not found`);
    }

    const nextDeliveryDate = subscription.nextCycleAt;
    
    // Create production tasks
    await this.createProductionTasksFromSubscription(
      subscriptionId,
      subscription.items,
      nextDeliveryDate
    );

    // Create delivery job
    await this.createDeliveryJob(
      `sub-${subscriptionId}`,
      subscription.address,
      nextDeliveryDate,
      "LOCAL_COURIER"
    );

    // Schedule next cycle
    await this.scheduleNextSubscriptionCycle(subscriptionId);
  }

  /**
   * Schedule next subscription cycle
   */
  async scheduleNextSubscriptionCycle(subscriptionId: string): Promise<void> {
    const db = await this.db;
    
    const subscription = await db.collection<EnhancedSubscription>("subscriptions")
      .findOne({ _id: subscriptionId });
    
    if (!subscription) return;

    const currentCycleDate = new Date(subscription.nextCycleAt);
    let nextCycleDate: Date;

    switch (subscription.frequency) {
      case "weekly":
        nextCycleDate = new Date(currentCycleDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        break;
      case "biweekly":
        nextCycleDate = new Date(currentCycleDate.getTime() + (14 * 24 * 60 * 60 * 1000));
        break;
      case "monthly":
        nextCycleDate = new Date(currentCycleDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        throw new Error(`Unknown frequency: ${subscription.frequency}`);
    }

    // Update subscription with next cycle date
    await db.collection<EnhancedSubscription>("subscriptions").updateOne(
      { _id: subscriptionId },
      { 
        $set: { 
          nextCycleAt: nextCycleDate.toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );

    // Schedule automation job for next cycle
    await this.scheduleAutomationJob({
      type: "subscription_cycle",
      payload: { subscriptionId },
      scheduledFor: nextCycleDate.toISOString(),
      maxAttempts: 3
    });
  }

  /**
   * Create delivery job
   */
  async createDeliveryJob(
    orderId: string, 
    address: any, 
    deliveryDate: string, 
    method: "LOCAL_COURIER" | "SHIPPING" | "PICKUP"
  ): Promise<DeliveryJob> {
    const db = await this.db;
    
    const deliveryJob: DeliveryJob = {
      orderId,
      method,
      status: "REQUESTED",
      address,
      scheduledFor: deliveryDate,
      webhookHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection<DeliveryJob>("deliveryJobs").insertOne(deliveryJob);
    deliveryJob._id = result.insertedId.toString();

    // Schedule delivery automation
    await this.scheduleDeliveryAutomation(deliveryJob._id, deliveryDate);

    return deliveryJob;
  }

  /**
   * Schedule delivery automation
   */
  async scheduleDeliveryAutomation(deliveryJobId: string, deliveryDate: string): Promise<void> {
    // Schedule courier pickup for day before delivery
    const pickupDate = new Date(deliveryDate);
    pickupDate.setDate(pickupDate.getDate() - 1);
    pickupDate.setHours(14, 0, 0, 0); // 2 PM pickup

    await this.scheduleAutomationJob({
      type: "delivery",
      payload: { 
        deliveryJobId,
        action: "request_courier"
      },
      scheduledFor: pickupDate.toISOString(),
      maxAttempts: 3
    });

    // Schedule delivery notifications
    const notificationDate = new Date(deliveryDate);
    notificationDate.setHours(8, 0, 0, 0); // 8 AM notification

    await this.scheduleAutomationJob({
      type: "notification",
      payload: {
        deliveryJobId,
        action: "delivery_out_for_delivery"
      },
      scheduledFor: notificationDate.toISOString(),
      maxAttempts: 2
    });
  }

  /**
   * Schedule automation job
   */
  async scheduleAutomationJob(job: Omit<AutomationJob, "_id" | "status" | "attempts" | "createdAt" | "updatedAt">): Promise<void> {
    const db = await this.db;
    
    const automationJob: AutomationJob = {
      ...job,
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection<AutomationJob>("automationJobs").insertOne(automationJob);
  }

  /**
   * Get pending production tasks for today
   */
  async getTodayProductionTasks(): Promise<ProductionTask[]> {
    const db = await this.db;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return await db.collection<ProductionTask>("productionTasks")
      .find({
        runAt: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() },
        status: { $in: ["PENDING", "READY"] }
      })
      .sort({ priority: 1, runAt: 1 })
      .toArray();
  }

  /**
   * Get pending automation jobs
   */
  async getPendingAutomationJobs(): Promise<AutomationJob[]> {
    const db = await this.db;
    const now = new Date().toISOString();

    return await db.collection<AutomationJob>("automationJobs")
      .find({
        status: "pending",
        scheduledFor: { $lte: now }
      })
      .sort({ scheduledFor: 1 })
      .toArray();
  }

  /**
   * Mark production task as completed
   */
  async completeProductionTask(taskId: string, notes?: string): Promise<void> {
    const db = await this.db;
    
    await db.collection<ProductionTask>("productionTasks").updateOne(
      { _id: taskId },
      { 
        $set: { 
          status: "DONE",
          notes: notes ? `${notes} - Completed at ${new Date().toISOString()}` : `Completed at ${new Date().toISOString()}`,
          updatedAt: new Date().toISOString()
        }
      }
    );
  }

  /**
   * Update delivery job status
   */
  async updateDeliveryJobStatus(deliveryJobId: string, status: string, trackingData?: any): Promise<void> {
    const db = await this.db;
    
    const update: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (trackingData?.trackingUrl) update.trackingUrl = trackingData.trackingUrl;
    if (trackingData?.trackingNumber) update.trackingNumber = trackingData.trackingNumber;
    if (trackingData?.eta) update.eta = trackingData.eta;

    // Add webhook history entry
    update.$push = {
      webhookHistory: {
        timestamp: new Date().toISOString(),
        status,
        message: trackingData?.message || `Status updated to ${status}`,
        providerData: trackingData
      }
    };

    await db.collection<DeliveryJob>("deliveryJobs").updateOne(
      { _id: deliveryJobId },
      update
    );
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine();
