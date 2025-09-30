import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { hash } from "bcryptjs";
import type { GuestOrder, UserProfile, CustomerData } from "@/lib/schema";
import { ObjectId } from "mongodb";

/**
 * Create account from guest order data
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, guestOrderId } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user account
    const userResult = await db.collection("users").insertOne({
      email,
      name,
      password: hashedPassword,
      emailVerified: new Date(),
      createdAt: new Date().toISOString(),
      provider: "email",
    });

    const userId = userResult.insertedId.toString();

    // Get guest orders to link
    let customerData: CustomerData | null = null;
    if (guestOrderId) {
      const guestOrder = await db.collection<GuestOrder>("guestOrders")
        .findOne({ _id: new ObjectId(guestOrderId) });
      
      if (guestOrder) {
        customerData = {
          email: guestOrder.email,
          name: guestOrder.orderData.customer.name,
          phone: guestOrder.orderData.customer.phone,
          address1: guestOrder.orderData.customer.address1,
          address2: guestOrder.orderData.customer.address2,
          city: guestOrder.orderData.customer.city,
          state: guestOrder.orderData.customer.state,
          zip: guestOrder.orderData.customer.zip,
          deliveryInstructions: guestOrder.orderData.customer.deliveryInstructions,
          preferredDeliveryDay: guestOrder.orderData.customer.preferredDeliveryDay,
          marketingOptIn: guestOrder.marketingOptIn,
          source: "email",
          firstOrderDate: guestOrder.createdAt,
          totalOrders: 1,
        };

        // Link guest order to new account
        await db.collection("guestOrders").updateOne(
          { _id: new ObjectId(guestOrderId) },
          { $set: { linkedToAccount: userId } }
        );
      }
    }

    // Create user profile
    const userProfile: UserProfile = {
      userId,
      email,
      name,
      phone: customerData?.phone,
      defaultDeliveryAddress: customerData ? {
        address1: customerData.address1,
        address2: customerData.address2,
        city: customerData.city,
        state: customerData.state,
        zip: customerData.zip,
      } : {
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
      },
      deliveryPreferences: {
        preferredDay: customerData?.preferredDeliveryDay ? 
          new Date(customerData.preferredDeliveryDay).getDay() : 5, // Default Friday
        deliveryWindow: "9:00-13:00",
        deliveryInstructions: customerData?.deliveryInstructions || "",
        autoRenew: true,
      },
      subscriptionDiscount: 10, // Default 10% for new subscribers
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("userProfiles").insertOne(userProfile);

    // Initialize loyalty points
    await db.collection("loyaltyTransactions").insertOne({
      userId,
      type: "earn",
      points: 50, // Welcome bonus
      source: "bonus",
      description: "Welcome bonus for creating account",
      createdAt: new Date().toISOString(),
    });

    // Add to email marketing if opted in
    if (customerData?.marketingOptIn) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/marketing/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            firstName: name.split(" ")[0],
            lastName: name.split(" ").slice(1).join(" "),
            tags: ["new-account", "guest-conversion"],
            source: "account-creation",
          }),
        });
      } catch (error) {
        console.error("Failed to add to email marketing:", error);
        // Don't fail account creation if marketing fails
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      message: "Account created successfully. Welcome to ChefPax!",
      linkedOrders: customerData ? 1 : 0,
      loyaltyPoints: 50,
    });
  } catch (error) {
    console.error("Error creating account from guest:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
