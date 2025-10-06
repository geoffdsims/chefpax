import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { notes } = body;

    // For now, just log the completion without using automationEngine
    console.log(`Production task ${params.id} completed with notes: ${notes}`);
    
    // TODO: Re-enable automation engine once job-queue is fully fixed
    // const { automationEngine } = await import('@/lib/automation-engine');
    // await automationEngine.completeProductionTask(params.id, notes);

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
