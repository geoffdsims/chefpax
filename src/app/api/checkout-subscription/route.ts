// app/api/checkout-subscription/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const priceId = process.env.STRIPE_SUB_PRICE_ID!;
    if (!priceId) return NextResponse.json({ error: "Missing price id" }, { status: 500 });

    const customerEmail = session?.user?.email ?? body?.email;
    const metadata: Record<string, string> = {};
    if (session?.user?.id) metadata.userId = session.user.id;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata,
      },
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/thanks?sub=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/shop`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: any) {
    console.error("checkout-subscription error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
