// app/api/checkout-subscription/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import type { Product } from "@/lib/schema";
import { logSubscriptionEvent } from "@/lib/subscription-safeguards";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" }) : null;

export async function POST(req: Request) {
  try {
    // Log subscription attempt
    logSubscriptionEvent('subscription_checkout_attempted', { timestamp: new Date().toISOString() });

    if (!stripe) {
      logSubscriptionEvent('subscription_checkout_failed', { error: 'Stripe not configured' });
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logSubscriptionEvent('subscription_checkout_failed', { error: 'Authentication required' });
      return NextResponse.json({ error: "Authentication required for subscriptions" }, { status: 401 });
    }

    const body = await req.json();
    const { cart, customer, deliveryDate } = body as {
      cart: { productId: string; qty: number }[];
      customer: { name: string; email: string; phone?: string; address1: string; address2?: string; city?: string; state?: string; zip?: string; deliveryInstructions?: string };
      deliveryDate?: string;
    };

    if (!cart?.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    if (!customer?.email || !customer?.name) return NextResponse.json({ error: "Missing customer information" }, { status: 400 });
    if (!customer?.address1) return NextResponse.json({ error: "Missing delivery address" }, { status: 400 });

    // Get products from database
    const db = await getDb();
    const ids = cart.map(c => c.productId);
    
    let products: Product[] = [];
    try {
      const objectIds = ids.map(id => {
        try {
          return new ObjectId(id);
        } catch (e) {
          return null;
        }
      }).filter(id => id !== null) as ObjectId[];

      if (objectIds.length > 0) {
        products = await db.collection("products").find({ 
          _id: { $in: objectIds } 
        }).toArray() as unknown as Product[];
      }

      if (products.length === 0) {
        products = await db.collection("products").find({ 
          $or: [
            { _id: { $in: ids } },
            { id: { $in: ids } },
            { slug: { $in: ids } }
          ]
        }).toArray() as unknown as Product[];
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ error: "Failed to fetch products from database" }, { status: 500 });
    }

    if (products.length !== ids.length) {
      return NextResponse.json({ error: "Some products not found" }, { status: 400 });
    }

    // Create line items for subscription
    const line_items = cart.map(c => {
      const p = products.find(x => x._id?.toString() === c.productId);
      if (!p) throw new Error(`Product not found: ${c.productId}`);
      return {
        quantity: c.qty,
        price_data: {
          currency: "usd",
          product_data: { name: p.name },
          unit_amount: Math.round(p.priceCents * 0.9), // 10% subscription discount
          recurring: {
            interval: "week" // Weekly subscription
          }
        },
      };
    });

    // Add delivery fee as recurring
    const deliveryFee = Number(process.env.CHEFPAX_DELIVERY_FEE_CENTS ?? 500);
    if (deliveryFee > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: { name: "Weekly Delivery" },
          unit_amount: deliveryFee,
          recurring: {
            interval: "week"
          }
        },
      });
    }

    const finalDeliveryDate = deliveryDate ? new Date(deliveryDate) : new Date();
    
    const metadata: Record<string, string> = {
      deliveryDate: finalDeliveryDate.toISOString(),
      deliveryDateFormatted: finalDeliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      address1: customer.address1,
      address2: customer.address2 ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      zip: customer.zip ?? "",
      name: customer.name,
      phone: customer.phone ?? "",
      deliveryInstructions: customer.deliveryInstructions ?? "",
      cart: JSON.stringify(cart),
      subscriptionType: "weekly"
    };

    const userId = (session.user as { id: string }).id;
    metadata.userId = userId;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items,
      subscription_data: {
        metadata,
      },
      customer_email: customer.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thanks?sub=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    });

    logSubscriptionEvent('subscription_checkout_success', { 
      userId: (session.user as { id: string }).id,
      cartItems: cart.length,
      totalAmount: line_items.reduce((sum, item) => sum + (item.quantity * (item.price_data?.unit_amount || 0)), 0)
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: unknown) {
    console.error("checkout-subscription error:", err);
    logSubscriptionEvent('subscription_checkout_failed', { 
      error: err instanceof Error ? err.message : "Server error",
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
