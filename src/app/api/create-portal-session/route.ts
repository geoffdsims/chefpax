// app/api/create-portal-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongoClient";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" }) : null;

export async function POST() {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const email = session.user.email;
    let stripeCustomerId: string | undefined;

    // Try find stripeCustomerId in your Mongo users collection (optional)
    if (clientPromise) {
      try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "chefpax");
        const users = db.collection("users"); // NextAuth creates users in this collection

        // Try to fetch stripeCustomerId from user document
        const userDoc = await users.findOne({ email });
        stripeCustomerId = userDoc?.stripeCustomerId as string | undefined;
      } catch (error) {
        console.warn("MongoDB not available, skipping user lookup:", error);
      }
    }

    if (!stripeCustomerId) {
      // Try find by email
      const list = await stripe.customers.search({ query: `email:"${email}"` }).catch(() => ({ data: [] as Stripe.Customer[] }));
      if (list && list.data && list.data.length) {
        stripeCustomerId = list.data[0].id;
      } else {
        // create customer
        if (!email) {
          throw new Error("Email is required to create Stripe customer");
        }
        const cust = await stripe.customers.create({ 
          email, 
          metadata: { userId: "temp" } 
        });
        stripeCustomerId = cust.id;
      }
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId!,
      return_url: process.env.NEXT_PUBLIC_BASE_URL || "/",
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: unknown) {
    console.error("create-portal-session error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
