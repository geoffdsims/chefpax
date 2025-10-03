import { NextResponse } from "next/server";
import { automationEngine } from "@/lib/automation-engine";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { notes } = body;

    await automationEngine.completeProductionTask(params.id, notes);

    return NextResponse.json({ 
      success: true,
      message: "Task marked as completed"
    });
  } catch (error) {
    console.error("Error completing production task:", error);
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    );
  }
}
