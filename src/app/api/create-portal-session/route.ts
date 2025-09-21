// app/api/create-portal-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongoClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const email = session.user.email;
    // Try find stripeCustomerId in your Mongo users collection (optional)
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "chefpax");
    const users = db.collection("users"); // NextAuth creates users in this collection

    // Try to fetch stripeCustomerId from user document
    const userDoc = await users.findOne({ email });
    let stripeCustomerId = userDoc?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      // Try find by email
      const list = await stripe.customers.search({ query: `email:"${email}"` }).catch(() => ({ data: [] as any[] }));
      if (list && (list as any).data && (list as any).data.length) {
        stripeCustomerId = (list as any).data[0].id;
      } else {
        // create customer
        const cust = await stripe.customers.create({ email, metadata: { userId: userDoc?._id?.toString?.() } });
        stripeCustomerId = cust.id;
      }
      // persist on user doc (optional)
      if (userDoc) await users.updateOne({ _id: userDoc._id }, { $set: { stripeCustomerId } });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId!,
      return_url: process.env.NEXT_PUBLIC_BASE_URL || "/",
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    console.error("create-portal-session error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
