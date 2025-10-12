import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { SlackService } from '@/lib/slack-notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const { taskId } = params;
    const body = await request.json();
    const { notes = '' } = body;

    // Validate taskId
    if (!ObjectId.isValid(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Update task status to DONE
    const result = await db.collection('productionTasks').updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          status: 'DONE',
          notes: notes,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if this was the last task in a production sequence
    const task = await db.collection('productionTasks').findOne({ _id: new ObjectId(taskId) });
    if (task) {
      // Send Slack notification for task completion
      await SlackService.sendTaskCompletion(task, notes);
      // If this was a HARVEST task, create the PACK task if it doesn't exist
      if (task.type === 'HARVEST') {
        const packTask = await db.collection('productionTasks').findOne({
          orderId: task.orderId,
          productId: task.productId,
          type: 'PACK'
        });

        if (!packTask) {
          await db.collection('productionTasks').insertOne({
            orderId: task.orderId,
            subscriptionId: task.subscriptionId,
            productId: task.productId,
            type: 'PACK',
            runAt: new Date(), // Pack immediately after harvest
            status: 'READY',
            priority: task.priority,
            notes: 'Auto-created after harvest completion',
            quantity: task.quantity,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      // If this was a SEED task, create subsequent tasks
      if (task.type === 'SEED') {
        await createProductionSequence(task, db);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully'
    });
  } catch (error) {
    console.error('Failed to complete task:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}

async function createProductionSequence(seedTask: any, db: any) {
  try {
    // Get product details to determine timing
    const product = await db.collection('products').findOne({ _id: seedTask.productId });
    if (!product || !product.stages) {
      console.error('Product not found or missing stages:', seedTask.productId);
      return;
    }

    const sowDate = new Date(seedTask.runAt);
    const tasks = [];

    // Create tasks based on product stages
    for (const stage of product.stages) {
      if (stage.type === 'SEED') continue; // Skip SEED as it's already created

      const runAt = new Date(sowDate);
      runAt.setDate(runAt.getDate() + stage.offsetDays);

      tasks.push({
        orderId: seedTask.orderId,
        subscriptionId: seedTask.subscriptionId,
        productId: seedTask.productId,
        type: stage.type,
        runAt: runAt,
        status: stage.offsetDays === 0 ? 'READY' : 'PENDING',
        priority: seedTask.priority,
        notes: stage.notes || '',
        quantity: seedTask.quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert all tasks
    if (tasks.length > 0) {
      await db.collection('productionTasks').insertMany(tasks);
      console.log(`✅ Created ${tasks.length} production tasks for ${product.name}`);
    }
  } catch (error) {
    console.error('Failed to create production sequence:', error);
  }
}
