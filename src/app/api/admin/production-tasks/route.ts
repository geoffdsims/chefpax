import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongoClient';

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const tasks = await db.collection('productionTasks')
      .find({})
      .sort({ runAt: 1, priority: -1 })
      .toArray();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch production tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const body = await request.json();
    const {
      orderId,
      subscriptionId,
      productId,
      type,
      runAt,
      priority = 'MEDIUM',
      notes,
      quantity = 1
    } = body;

    // Validate required fields
    if (!productId || !type || !runAt) {
      return NextResponse.json({ 
        error: 'Missing required fields: productId, type, runAt' 
      }, { status: 400 });
    }

    const task = {
      orderId: orderId || null,
      subscriptionId: subscriptionId || null,
      productId,
      type,
      runAt: new Date(runAt),
      status: 'PENDING',
      priority,
      notes: notes || '',
      quantity,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('productionTasks').insertOne(task);

    return NextResponse.json({
      success: true,
      taskId: result.insertedId,
      message: 'Production task created successfully'
    });
  } catch (error) {
    console.error('Failed to create production task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}