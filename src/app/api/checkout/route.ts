import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { stripe } from "@/lib/stripe";
import { nextDeliveryDateNow } from "@/lib/dates";
import type { Product } from "@/lib/schema";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const body = await req.json();
  const { cart, customer, marketingOptIn = false, createAccount = false } = body as {
    cart: { productId: string; qty: number }[];
    customer: { name: string; email: string; phone?: string; address1: string; address2?: string; city: string; state: string; zip: string; deliveryInstructions?: string };
    marketingOptIn?: boolean;
    createAccount?: boolean;
  };

  if (!cart?.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

  const db = await getDb();
  const ids = cart.map(c => c.productId);
  const products = await db.collection("products").find({ 
    _id: { $in: ids.map(id => new ObjectId(id)) } 
  }).toArray() as unknown as Product[];

  // map line items
  const line_items = cart.map(c => {
    const p = products.find(x => x._id?.toString() === c.productId)!;
    return {
      quantity: c.qty,
      price_data: {
        currency: "usd",
        product_data: { name: p.name },
        unit_amount: p.priceCents,
      },
    };
  });

  // delivery fee
  const deliveryFee = Number(process.env.CHEFPAX_DELIVERY_FEE_CENTS ?? 500);
  if (deliveryFee > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        product_data: { name: "Local Delivery" },
        unit_amount: deliveryFee,
      },
    });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const deliveryDate = nextDeliveryDateNow();
  const authSession = await getServerSession(authOptions);
  
  const metadata: Record<string, string> = {
    deliveryDate: deliveryDate.toISOString(),
    address1: customer.address1,
    address2: customer.address2 ?? "",
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
    name: customer.name,
    phone: customer.phone ?? "",
    deliveryInstructions: customer.deliveryInstructions ?? "",
    marketingOptIn: marketingOptIn.toString(),
    createAccount: createAccount.toString(),
    cart: JSON.stringify(cart),
  };
  
  // Include user ID if signed in
  if (authSession?.user && (authSession.user as { id?: string }).id) {
    metadata.userId = (authSession.user as { id: string }).id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thanks?d=${deliveryDate.toISOString()}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    customer_email: customer.email,
    metadata,
  });

  // Create guest order record for tracking (if not authenticated)
  if (!authSession?.user) {
    try {
      const totalAmount = line_items.reduce((sum, item) => {
        return sum + (item.quantity * (item.price_data?.unit_amount || 0));
      }, 0);

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/guest-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer.email,
          stripeSessionId: session.id,
          orderData: {
            customer,
            cart,
            totalAmount,
            deliveryDate: deliveryDate.toISOString(),
          },
          marketingOptIn,
        }),
      });
    } catch (error) {
      console.error("Failed to create guest order record:", error);
      // Don't fail checkout if guest tracking fails
    }
  }

  return NextResponse.json({ url: session.url });
}
