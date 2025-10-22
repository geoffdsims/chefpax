/**
 * Production Task Scheduler
 * 
 * Creates production tasks from orders based on product lead times and grow cycles
 */

import { getDb } from "./mongo";
import type { Product, Order, ProductionTask } from "./schema";
import { getProductsWithInventory } from "./inventory";

export interface TaskCreationResult {
  success: boolean;
  tasksCreated: number;
  errors: string[];
}

/**
 * Create production tasks from a completed order
 */
export async function createProductionTasksFromOrder(order: Order): Promise<TaskCreationResult> {
  const result: TaskCreationResult = {
    success: false,
    tasksCreated: 0,
    errors: []
  };

  try {
    const db = await getDb();
    const products = getProductsWithInventory();
    
    // Get product details for each item in the order
    const orderItems = order.items.map(item => {
      const product = products.find(p => p._id === item.productId || p.sku === item.productId);
      if (!product) {
        result.errors.push(`Product not found: ${item.productId}`);
        return null;
      }
      return { ...item, product };
    }).filter(Boolean);

    if (result.errors.length > 0) {
      return result;
    }

    const tasks: ProductionTask[] = [];
    const deliveryDate = new Date(order.deliveryDate);

    // Create tasks for each item
    for (const item of orderItems) {
      if (!item.product.stages) {
        result.errors.push(`No production stages defined for product: ${item.product.name}`);
        continue;
      }

      // Create tasks based on product stages
      for (const stage of item.product.stages) {
        const taskDate = new Date(deliveryDate);
        taskDate.setDate(taskDate.getDate() - (item.product.leadTimeDays - stage.offsetDays));

        const task: ProductionTask = {
          orderId: order._id?.toString() || '',
          productId: item.productId,
          productName: item.product.name,
          quantity: item.qty,
          stage: stage.type,
          scheduledDate: taskDate.toISOString(),
          dueDate: taskDate.toISOString(),
          status: 'pending',
          priority: getTaskPriority(stage.type, taskDate),
          notes: stage.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        tasks.push(task);
      }
    }

    // Save tasks to database
    if (tasks.length > 0) {
      await db.collection("productionTasks").insertMany(tasks);
      result.tasksCreated = tasks.length;
    }

    result.success = true;
    return result;

  } catch (error) {
    console.error("Error creating production tasks:", error);
    result.errors.push(`Failed to create tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Get task priority based on stage type and due date
 */
function getTaskPriority(stage: string, dueDate: Date): 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Critical stages that can't be delayed
  if (stage === 'HARVEST' || stage === 'PACK') {
    if (daysUntilDue <= 1) return 'URGENT';
    if (daysUntilDue <= 3) return 'HIGH';
    return 'MEDIUM';
  }

  // Seeding is time-sensitive
  if (stage === 'SEED') {
    if (daysUntilDue <= 0) return 'URGENT';
    if (daysUntilDue <= 2) return 'HIGH';
    return 'MEDIUM';
  }

  // Other stages
  if (daysUntilDue <= 0) return 'URGENT';
  if (daysUntilDue <= 2) return 'HIGH';
  if (daysUntilDue <= 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get production tasks for a specific date range
 */
export async function getProductionTasks(startDate: Date, endDate: Date): Promise<ProductionTask[]> {
  try {
    const db = await getDb();
    const tasks = await db.collection("productionTasks")
      .find({
        scheduledDate: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        }
      })
      .sort({ scheduledDate: 1, priority: 1 })
      .toArray();

    return tasks as ProductionTask[];
  } catch (error) {
    console.error("Error fetching production tasks:", error);
    return [];
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<boolean> {
  try {
    const db = await getDb();
    const result = await db.collection("productionTasks").updateOne(
      { _id: taskId },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating task status:", error);
    return false;
  }
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(status: string): Promise<ProductionTask[]> {
  try {
    const db = await getDb();
    const tasks = await db.collection("productionTasks")
      .find({ status })
      .sort({ scheduledDate: 1, priority: 1 })
      .toArray();

    return tasks as ProductionTask[];
  } catch (error) {
    console.error("Error fetching tasks by status:", error);
    return [];
  }
}