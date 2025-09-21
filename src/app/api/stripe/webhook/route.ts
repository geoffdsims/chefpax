import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/mongo";
import type { Order } from "@/lib/schema";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature")!;
  const buf = Buffer.from(await req.arrayBuffer());
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: unknown) {
    return new NextResponse(`Webhook error: ${e instanceof Error ? e.message : 'Unknown error'}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as {
      id: string;
      customer_details?: { email?: string };
      metadata?: Record<string, string>;
    };
    const meta = s.metadata ?? {};
    const cart = JSON.parse(meta.cart || "[]");
    const deliveryFeeCents = cart.length ? Number(process.env.CHEFPAX_DELIVERY_FEE_CENTS ?? 500) : 0;

    const items = cart.map((c: { productId: string; name: string; priceCents: number; qty: number }) => ({
      productId: c.productId,
      name: c.name ?? "",
      priceCents: c.priceCents ?? 0,
      qty: c.qty,
    }));

    // If you want canonical prices/names, you can re-query products here.

    const subtotalCents = items.reduce((a: number, it: { priceCents: number; qty: number }) => a + it.priceCents * it.qty, 0);
    const totalCents = subtotalCents + deliveryFeeCents;

    const order: Order & { userId?: string } = {
      status: "paid",
      customerName: meta.name,
      email: s.customer_details?.email ?? meta.email,
      phone: meta.phone,
      address1: meta.address1,
      address2: meta.address2 || "",
      city: meta.city,
      state: meta.state,
      zip: meta.zip,
      deliveryDate: meta.deliveryDate,
      createdAt: new Date().toISOString(),
      stripeSessionId: s.id,
      items,
      deliveryFeeCents,
      subtotalCents,
      totalCents,
      userId: meta.userId, // Include user ID if present
    };

    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection("orders").insertOne(order as any);
  }

  return NextResponse.json({ received: true });
}
