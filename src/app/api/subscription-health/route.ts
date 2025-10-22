import { NextResponse } from "next/server";
import { subscriptionSafeguards } from "@/lib/subscription-safeguards";

export async function GET() {
  try {
    const health = await subscriptionSafeguards.checkHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({
      status: 'broken',
      issues: ['Health check failed'],
      lastChecked: new Date().toISOString()
    }, { status: 500 });
  }
}
