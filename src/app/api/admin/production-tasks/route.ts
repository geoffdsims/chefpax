import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function GET() {
  try {
    const db = await getDb();
    const tasks = await db.collection('productionTasks').find({}).toArray();
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching production tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();
    
    const task = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('productionTasks').insertOne(task);
    
    return NextResponse.json({ 
      success: true,
      taskId: result.insertedId 
    });
  } catch (error) {
    console.error("Error creating production task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
