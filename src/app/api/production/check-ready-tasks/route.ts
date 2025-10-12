import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { SlackService } from '@/lib/slack-notifications';
import { getUpcomingTasks } from '@/lib/production-scheduler';

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find tasks that are ready to run (within the next hour)
    const readyTasks = await db.collection('productionTasks')
      .find({
        status: 'PENDING',
        runAt: {
          $gte: now,
          $lte: oneHourFromNow
        }
      })
      .toArray();

    // Find overdue tasks
    const overdueTasks = await db.collection('productionTasks')
      .find({
        status: 'PENDING',
        runAt: { $lt: now }
      })
      .toArray();

    const notificationsSent = [];

    // Send notifications for ready tasks
    for (const task of readyTasks) {
      try {
        // Mark task as READY
        await db.collection('productionTasks').updateOne(
          { _id: task._id },
          { $set: { status: 'READY', updatedAt: new Date() } }
        );

        // Send Slack notification
        const sent = await SlackService.sendProductionAlert(task);
        if (sent) {
          notificationsSent.push({
            taskId: task._id,
            type: task.type,
            status: 'notification_sent'
          });
        }
      } catch (error) {
        console.error(`Failed to process ready task ${task._id}:`, error);
      }
    }

    // Send urgent alerts for overdue tasks
    for (const task of overdueTasks) {
      try {
        const sent = await SlackService.sendUrgentAlert(task);
        if (sent) {
          notificationsSent.push({
            taskId: task._id,
            type: task.type,
            status: 'urgent_alert_sent'
          });
        }
      } catch (error) {
        console.error(`Failed to send urgent alert for task ${task._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      readyTasks: readyTasks.length,
      overdueTasks: overdueTasks.length,
      notificationsSent: notificationsSent.length,
      details: notificationsSent
    });
  } catch (error) {
    console.error('Failed to check ready tasks:', error);
    return NextResponse.json({ error: 'Failed to check ready tasks' }, { status: 500 });
  }
}

// POST endpoint to manually trigger task checks (for testing)
export async function POST() {
  return GET();
}
