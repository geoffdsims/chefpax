/**
 * Enhanced Stripe Webhook Handler with Automation Integration
 * Processes orders and subscriptions to create production tasks and delivery jobs
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/mongo";
import { automationEngine } from "@/lib/automation-engine";
import { calculateOrderTimeline } from "@/lib/orderLifecycle";
import type { Order, EnhancedSubscription } from "@/lib/schema";
import type { EnhancedProduct, ProductionTask } from "@/lib/schema-automation";

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
    console.error("Webhook signature verification failed:", e);
    return new NextResponse(`Webhook error: ${e instanceof Error ? e.message : 'Unknown error'}`, { status: 400 });
  }

  const db = await getDb();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, db);
        break;
        
      case "invoice.paid":
        await handleInvoicePaid(event.data.object, db);
        break;
        
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, db);
        break;
        
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, db);
        break;
        
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, db);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: any, db: any) {
  console.log("Processing checkout.session.completed:", session.id);
  
  const meta = session.metadata ?? {};
  const cart = JSON.parse(meta.cart || "[]");
  const deliveryFeeCents = cart.length ? Number(process.env.CHEFPAX_DELIVERY_FEE_CENTS ?? 500) : 0;

  const items = cart.map((c: any) => ({
    productId: c.productId,
    name: c.name ?? "",
    priceCents: c.priceCents ?? 0,
    qty: c.qty,
  }));

  const subtotalCents = items.reduce((a: number, it: any) => a + it.priceCents * it.qty, 0);
  const totalCents = subtotalCents + deliveryFeeCents;

  const orderDate = new Date();
  const deliveryDate = new Date(meta.deliveryDate);
  
  const order: Order & { userId?: string } = {
    status: "paid",
    customerName: meta.name,
    email: meta.email || session.customer_details?.email || "",
    phone: meta.phone,
    address1: meta.address1,
    address2: meta.address2,
    city: meta.city,
    state: meta.state,
    zip: meta.zip,
    deliveryDate: deliveryDate.toISOString(),
    deliveryWindow: "9:00-13:00",
    createdAt: orderDate.toISOString(),
    stripeSessionId: session.id,
    items,
    deliveryFeeCents,
    subtotalCents,
    totalCents,
    userId: meta.userId,
    orderType: "one_time",
    lifecycle: calculateOrderTimeline(orderDate, deliveryDate),
    deliveryInstructions: meta.deliveryInstructions,
    trackingNumber: `CP${Date.now().toString().slice(-8)}`,
  };

  // Save order
  const orderResult = await db.collection("orders").insertOne(order);
  const orderId = orderResult.insertedId.toString();

  // Create production tasks for each product
  for (const item of items) {
    await automationEngine.createProductionTasksFromOrder(
      orderId,
      item.productId,
      item.qty,
      deliveryDate.toISOString()
    );
  }

  // Create delivery job
  await automationEngine.createDeliveryJob(
    orderId,
    {
      name: meta.name,
      line1: meta.address1,
      line2: meta.address2,
      city: meta.city,
      state: meta.state,
      zip: meta.zip,
      phone: meta.phone
    },
    deliveryDate.toISOString(),
    "LOCAL_COURIER"
  );

  // Post-purchase processing (loyalty, marketing, guest linking)
  await processPostPurchaseTasks(order, meta);

  console.log(`Order ${orderId} created with production tasks and delivery job`);
}

async function handleInvoicePaid(invoice: any, db: any) {
  console.log("Processing invoice.paid:", invoice.id);
  
  // This handles subscription renewals
  if (invoice.subscription) {
    const subscription = await db.collection<EnhancedSubscription>("subscriptions")
      .findOne({ "stripe.subscriptionId": invoice.subscription });
    
    if (subscription) {
      await automationEngine.processSubscriptionCycle(subscription._id!);
      console.log(`Subscription cycle processed for ${subscription._id}`);
    }
  }
}

async function handleSubscriptionCreated(subscription: any, db: any) {
  console.log("Processing customer.subscription.created:", subscription.id);
  
  // Create subscription record in database
  const enhancedSubscription: EnhancedSubscription = {
    customerId: subscription.customer,
    stripe: {
      subscriptionId: subscription.id,
      priceId: subscription.items.data[0].price.id,
      customerId: subscription.customer
    },
    status: subscription.status === "active" ? "active" : "paused",
    items: [], // Will be populated from subscription items
    frequency: "weekly", // Default, should be determined from price metadata
    deliveryDayOfWeek: 5, // Friday default
    nextCycleAt: new Date(subscription.current_period_end * 1000).toISOString(),
    address: {
      name: "",
      line1: "",
      city: "",
      state: "",
      zip: ""
    },
    autoRenew: !subscription.cancel_at_period_end,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.collection<EnhancedSubscription>("subscriptions").insertOne(enhancedSubscription);
  console.log(`Subscription ${subscription.id} created in database`);
}

async function handleSubscriptionUpdated(subscription: any, db: any) {
  console.log("Processing customer.subscription.updated:", subscription.id);
  
  const update: any = {
    status: subscription.status === "active" ? "active" : "paused",
    autoRenew: !subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString()
  };

  if (subscription.pause_collection) {
    update.pauseUntil = new Date(subscription.pause_collection.resumes_at * 1000).toISOString();
  }

  await db.collection<EnhancedSubscription>("subscriptions").updateOne(
    { "stripe.subscriptionId": subscription.id },
    { $set: update }
  );
  
  console.log(`Subscription ${subscription.id} updated`);
}

async function handleSubscriptionDeleted(subscription: any, db: any) {
  console.log("Processing customer.subscription.deleted:", subscription.id);
  
  await db.collection<EnhancedSubscription>("subscriptions").updateOne(
    { "stripe.subscriptionId": subscription.id },
    { 
      $set: { 
        status: "cancelled",
        updatedAt: new Date().toISOString()
      }
    }
  );
  
  console.log(`Subscription ${subscription.id} marked as cancelled`);
}

async function processPostPurchaseTasks(order: any, meta: any) {
  try {
    // Award loyalty points if user is authenticated
    if (meta.userId) {
      const pointsPerDollar = parseInt(process.env.LOYALTY_POINTS_PER_DOLLAR || "1");
      const pointsToAward = Math.round((order.totalCents / 100) * pointsPerDollar);
      
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: meta.userId,
          points: pointsToAward,
          source: "purchase",
          description: `Points earned from order ${order.stripeSessionId}`,
          orderId: order.stripeSessionId,
        }),
      });
    }

    // Add to email marketing if opted in
    if (meta.marketingOptIn === "true") {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/marketing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: order.email,
          firstName: order.customerName.split(" ")[0],
          lastName: order.customerName.split(" ").slice(1).join(" "),
          tags: ["customer", "first-order"],
          source: "checkout",
          subscriptionTier: meta.userId ? "basic" : undefined,
        }),
      });
    }
  } catch (error) {
    console.error("Post-purchase processing error:", error);
  }
}
