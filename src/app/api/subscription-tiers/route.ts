import { NextResponse } from "next/server";
import type { SubscriptionTier } from "@/lib/schema";

/**
 * Get available subscription tiers
 */
export async function GET(req: Request) {
  try {
    const tiers: SubscriptionTier[] = [
      {
        name: "basic",
        discount: parseInt(process.env.SUBSCRIPTION_BASIC_DISCOUNT || "10"),
        freeDelivery: false,
        prioritySupport: false,
        exclusiveProducts: [],
        loyaltyMultiplier: 1.2,
      },
      {
        name: "premium",
        discount: parseInt(process.env.SUBSCRIPTION_PREMIUM_DISCOUNT || "15"),
        freeDelivery: true,
        prioritySupport: true,
        exclusiveProducts: ["CHEFPAX_MIX_LIVE_TRAY", "PEA_LIVE_TRAY"],
        loyaltyMultiplier: 1.5,
      },
      {
        name: "pro",
        discount: parseInt(process.env.SUBSCRIPTION_PRO_DISCOUNT || "20"),
        freeDelivery: true,
        prioritySupport: true,
        exclusiveProducts: ["CHEFPAX_MIX_LIVE_TRAY", "PEA_LIVE_TRAY", "RADISH_LIVE_TRAY", "SUNFLOWER_LIVE_TRAY"],
        loyaltyMultiplier: 2.0,
      },
    ];

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("Error fetching subscription tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription tiers" },
      { status: 500 }
    );
  }
}

/**
 * Get tier benefits for a specific tier
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tierName } = body;

    if (!tierName) {
      return NextResponse.json(
        { error: "Tier name is required" },
        { status: 400 }
      );
    }

    const tiers: Record<string, SubscriptionTier> = {
      basic: {
        name: "basic",
        discount: parseInt(process.env.SUBSCRIPTION_BASIC_DISCOUNT || "10"),
        freeDelivery: false,
        prioritySupport: false,
        exclusiveProducts: [],
        loyaltyMultiplier: 1.2,
      },
      premium: {
        name: "premium",
        discount: parseInt(process.env.SUBSCRIPTION_PREMIUM_DISCOUNT || "15"),
        freeDelivery: true,
        prioritySupport: true,
        exclusiveProducts: ["CHEFPAX_MIX_LIVE_TRAY", "PEA_LIVE_TRAY"],
        loyaltyMultiplier: 1.5,
      },
      pro: {
        name: "pro",
        discount: parseInt(process.env.SUBSCRIPTION_PRO_DISCOUNT || "20"),
        freeDelivery: true,
        prioritySupport: true,
        exclusiveProducts: ["CHEFPAX_MIX_LIVE_TRAY", "PEA_LIVE_TRAY", "RADISH_LIVE_TRAY", "SUNFLOWER_LIVE_TRAY"],
        loyaltyMultiplier: 2.0,
      },
    };

    const tier = tiers[tierName];
    if (!tier) {
      return NextResponse.json(
        { error: "Invalid tier name" },
        { status: 400 }
      );
    }

    return NextResponse.json(tier);
  } catch (error) {
    console.error("Error fetching tier benefits:", error);
    return NextResponse.json(
      { error: "Failed to fetch tier benefits" },
      { status: 500 }
    );
  }
}
