import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/init-db";

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({ 
      success: true, 
      message: "Database collections and indexes created successfully" 
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { 
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
