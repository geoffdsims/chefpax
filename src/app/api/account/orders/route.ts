// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongoClient";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Check if MongoDB is configured
  if (!clientPromise) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "chefpax");
    const orders = await db
      .collection("orders")
      .find({ userId: (session.user as { id: string }).id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
