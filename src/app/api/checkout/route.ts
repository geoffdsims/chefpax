import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { stripe } from "@/lib/stripe";
import { nextDeliveryDateNow } from "@/lib/dates";
import type { Product } from "@/lib/schema";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { EmailService } from "@/lib/email-service";
import { rateLimit } from "@/lib/rate-limit";
import { captureApiError } from "@/lib/sentry-api";

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const rateLimitResult = rateLimit(5, 60000)(req as any);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { cart, customer, marketingOptIn = false, createAccount = false, deliveryDate, isSubscription = false } = body as {
      cart: { productId: string; qty: number }[];
      customer: { name: string; email: string; phone?: string; address1: string; address2?: string; city?: string; state?: string; zip?: string; deliveryInstructions?: string };
      marketingOptIn?: boolean;
      createAccount?: boolean;
      deliveryDate?: string;
      isSubscription?: boolean;
    };

    if (!cart?.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    if (!customer?.email || !customer?.name) return NextResponse.json({ error: "Missing customer information" }, { status: 400 });
    if (!customer?.address1) return NextResponse.json({ error: "Missing delivery address" }, { status: 400 });

    console.log("Checkout request - Cart:", JSON.stringify(cart, null, 2));
    console.log("Checkout request - Customer:", JSON.stringify(customer, null, 2));

  const db = await getDb();
  const ids = cart.map(c => c.productId);
  console.log("Looking for product IDs:", ids);
  console.log("Cart items:", cart);
  
  // Try to convert IDs to ObjectId, but handle invalid IDs
  let products: Product[] = [];
  try {
    // First try to find products by ObjectId
    const objectIds = ids.map(id => {
      try {
        return new ObjectId(id);
      } catch (e) {
        console.error(`Invalid ObjectId: ${id}`, e);
        return null;
      }
    }).filter(id => id !== null) as ObjectId[];

    if (objectIds.length > 0) {
      products = await db.collection("products").find({ 
        _id: { $in: objectIds } 
      }).toArray() as unknown as Product[];
    }

    // If no products found by ObjectId, try by string ID
    if (products.length === 0) {
      console.log("No products found by ObjectId, trying string ID search...");
      products = await db.collection("products").find({ 
        $or: [
          { _id: { $in: ids } },
          { id: { $in: ids } },
          { slug: { $in: ids } }
        ]
      }).toArray() as unknown as Product[];
    }

    console.log("Found products:", products.map(p => ({ id: p._id?.toString(), name: p.name })));
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products from database" }, { status: 500 });
  }

  // Validate that all products were found
  if (products.length !== ids.length) {
    const foundIds = products.map(p => p._id?.toString());
    const missingIds = ids.filter(id => !foundIds.includes(id));
    console.error("Missing products:", missingIds);
    return NextResponse.json({ error: `Products not found: ${missingIds.join(", ")}` }, { status: 400 });
  }

  // map line items
  const line_items = cart.map(c => {
    const p = products.find(x => x._id?.toString() === c.productId);
    if (!p) {
      console.error("Product not found for ID:", c.productId);
      throw new Error(`Product not found: ${c.productId}`);
    }
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

  // subscription discount (10% off subtotal)
  if (isSubscription) {
    const subtotal = line_items.reduce((sum, item) => {
      return sum + (item.quantity * (item.price_data?.unit_amount || 0));
    }, 0);
    const discountAmount = Math.round(subtotal * 0.1); // 10% discount
    
    if (discountAmount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: { name: "Subscription Discount (10%)" },
          unit_amount: -discountAmount, // Negative amount for discount
        },
      });
    }
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const finalDeliveryDate = deliveryDate ? new Date(deliveryDate) : nextDeliveryDateNow();
  const authSession = await getServerSession(authOptions);
  
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
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thanks?d=${finalDeliveryDate.toISOString()}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    customer_email: customer.email,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    // Pre-fill billing address if we have it
    ...(customer.address1 && {
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    }),
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
            deliveryDate: finalDeliveryDate.toISOString(),
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
  } catch (error: any) {
    console.error("Checkout API error:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error message:", error?.message);
    
    captureApiError(error, { 
      endpoint: 'checkout',
      cart: cart?.length || 0,
      customerEmail: customer?.email 
    });
    
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error?.message || "Unknown error",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
