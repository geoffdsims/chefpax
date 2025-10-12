import { getDb } from './mongo';

export interface ProductionTask {
  orderId?: string;
  subscriptionId?: string;
  productId: string;
  type: 'SEED' | 'GERMINATE' | 'LIGHT' | 'HARVEST' | 'PACK';
  runAt: Date;
  status: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'DONE' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notes?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  sku?: string;
}

export async function createProductionTasksFromOrder(
  orderId: string,
  items: OrderItem[],
  deliveryDate: string,
  isSubscription: boolean = false,
  subscriptionId?: string
): Promise<{ success: boolean; taskIds: string[]; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, taskIds: [], error: 'Database not available' };
    }

    const taskIds: string[] = [];
    const deliveryDateTime = new Date(deliveryDate);

    for (const item of items) {
      try {
        // Get product details
        const product = await db.collection('products').findOne({ _id: item.productId });
        if (!product || !product.stages) {
          console.error(`Product not found or missing stages: ${item.productId}`);
          continue;
        }

        // Calculate sow date based on delivery date and lead time
        const sowDate = new Date(deliveryDateTime);
        sowDate.setDate(sowDate.getDate() - (product.leadTimeDays || 10));

        // Determine priority based on delivery urgency
        const daysUntilDelivery = Math.ceil((deliveryDateTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
        
        if (daysUntilDelivery < 3) priority = 'URGENT';
        else if (daysUntilDelivery < 7) priority = 'HIGH';
        else if (daysUntilDelivery < 14) priority = 'MEDIUM';
        else priority = 'LOW';

        // Create production tasks based on product stages
        const tasks: ProductionTask[] = [];

        for (const stage of product.stages) {
          const runAt = new Date(sowDate);
          runAt.setDate(runAt.getDate() + stage.offsetDays);

          const task: ProductionTask = {
            orderId: isSubscription ? undefined : orderId,
            subscriptionId: isSubscription ? subscriptionId : undefined,
            productId: item.productId,
            type: stage.type,
            runAt: runAt,
            status: stage.offsetDays === 0 ? 'READY' : 'PENDING',
            priority: priority,
            notes: stage.notes || `${item.name} - ${stage.type}`,
            quantity: item.qty,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          tasks.push(task);
        }

        // Insert tasks into database
        if (tasks.length > 0) {
          const result = await db.collection('productionTasks').insertMany(tasks);
          taskIds.push(...Object.values(result.insertedIds).map(id => id.toString()));
          
          console.log(`✅ Created ${tasks.length} production tasks for ${item.qty}× ${item.name}`);
          console.log(`   Sow date: ${sowDate.toDateString()}`);
          console.log(`   Delivery date: ${deliveryDateTime.toDateString()}`);
          console.log(`   Priority: ${priority}`);
        }

      } catch (itemError) {
        console.error(`Error creating production tasks for ${item.name}:`, itemError);
      }
    }

    return { success: true, taskIds };
  } catch (error) {
    console.error('Failed to create production tasks from order:', error);
    return { success: false, taskIds: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getUpcomingTasks(days: number = 7): Promise<ProductionTask[]> {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const tasks = await db.collection('productionTasks')
      .find({
        runAt: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $in: ['PENDING', 'READY'] }
      })
      .sort({ runAt: 1, priority: -1 })
      .toArray();

    return tasks;
  } catch (error) {
    console.error('Failed to fetch upcoming tasks:', error);
    return [];
  }
}

export async function markTaskReady(taskId: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      return false;
    }

    const result = await db.collection('productionTasks').updateOne(
      { _id: taskId },
      {
        $set: {
          status: 'READY',
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to mark task as ready:', error);
    return false;
  }
}

export async function getProductionSummary(): Promise<{
  todayTasks: number;
  urgentTasks: number;
  overdueTasks: number;
  completedToday: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { todayTasks: 0, urgentTasks: 0, overdueTasks: 0, completedToday: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayTasks, urgentTasks, overdueTasks, completedToday] = await Promise.all([
      // Today's tasks
      db.collection('productionTasks').countDocuments({
        runAt: { $gte: today, $lt: tomorrow },
        status: { $ne: 'DONE' }
      }),
      
      // Urgent tasks
      db.collection('productionTasks').countDocuments({
        priority: 'URGENT',
        status: { $ne: 'DONE' }
      }),
      
      // Overdue tasks
      db.collection('productionTasks').countDocuments({
        runAt: { $lt: new Date() },
        status: 'PENDING'
      }),
      
      // Completed today
      db.collection('productionTasks').countDocuments({
        updatedAt: { $gte: today, $lt: tomorrow },
        status: 'DONE'
      })
    ]);

    return { todayTasks, urgentTasks, overdueTasks, completedToday };
  } catch (error) {
    console.error('Failed to get production summary:', error);
    return { todayTasks: 0, urgentTasks: 0, overdueTasks: 0, completedToday: 0 };
  }
}
