import type { Order, OrderLifecycle, OrderStage, MicrogreenStage } from "./schema";

/**
 * Define the standard order lifecycle stages for microgreens
 */
export function getStandardOrderStages(): OrderStage[] {
  return [
    {
      id: "payment_confirmed",
      name: "Payment Confirmed",
      description: "Your payment has been processed and your order is confirmed",
      status: "pending",
      estimatedDuration: 1,
      icon: "💳",
      color: "#4CAF50",
      details: "Order received and payment verified"
    },
    {
      id: "seeding",
      name: "Seeding Your Microgreens",
      description: "We're preparing and seeding your microgreen trays",
      status: "pending",
      estimatedDuration: 4,
      icon: "🌱",
      color: "#8BC34A",
      details: "Seeds planted in premium growing medium"
    },
    {
      id: "sprouting",
      name: "Sprouting Phase",
      description: "Your microgreens are beginning to sprout",
      status: "pending",
      estimatedDuration: 48,
      icon: "🌿",
      color: "#CDDC39",
      details: "First signs of growth appearing"
    },
    {
      id: "growing",
      name: "Growing Phase",
      description: "Your microgreens are growing strong and healthy",
      status: "pending",
      estimatedDuration: 72,
      icon: "🌾",
      color: "#FFC107",
      details: "Rapid growth phase with optimal nutrition"
    },
    {
      id: "ready",
      name: "Ready for Harvest",
      description: "Your microgreens are ready and being prepared for delivery",
      status: "pending",
      estimatedDuration: 8,
      icon: "✂️",
      color: "#FF9800",
      details: "Harvested fresh and packaged for delivery"
    },
    {
      id: "out_for_delivery",
      name: "Out for Delivery",
      description: "Your order is on its way to you",
      status: "pending",
      estimatedDuration: 4,
      icon: "🚚",
      color: "#2196F3",
      details: "Driver en route to your delivery address"
    },
    {
      id: "delivered",
      name: "Delivered",
      description: "Your fresh microgreens have been delivered",
      status: "pending",
      estimatedDuration: 0,
      icon: "✅",
      color: "#4CAF50",
      details: "Enjoy your fresh, locally grown microgreens!"
    }
  ];
}

/**
 * Calculate estimated timeline for an order
 */
export function calculateOrderTimeline(orderDate: Date, deliveryDate: Date): OrderLifecycle {
  const stages = getStandardOrderStages();
  const now = new Date();
  const orderTime = orderDate.getTime();
  const deliveryTime = deliveryDate.getTime();
  const totalDuration = deliveryTime - orderTime;
  
  // Calculate stage durations based on total time
  const stageDurations = [
    1,    // Payment confirmed (1 hour)
    4,    // Seeding (4 hours)
    48,   // Sprouting (48 hours)
    72,   // Growing (72 hours)
    8,    // Ready (8 hours)
    4,    // Out for delivery (4 hours)
    0     // Delivered (immediate)
  ];

  let currentStage = "payment_confirmed";
  let currentStageIndex = 0;
  let elapsedTime = 0;

  // Determine current stage based on elapsed time
  for (let i = 0; i < stageDurations.length; i++) {
    const stageDuration = stageDurations[i] * 60 * 60 * 1000; // Convert hours to milliseconds
    if (now.getTime() - orderTime < elapsedTime + stageDuration) {
      currentStage = stages[i].id;
      currentStageIndex = i;
      break;
    }
    elapsedTime += stageDuration;
  }

  // Update stage statuses
  const updatedStages = stages.map((stage, index) => {
    let status: "pending" | "active" | "completed" = "pending";
    
    if (index < currentStageIndex) {
      status = "completed";
    } else if (index === currentStageIndex) {
      status = "active";
    }

    return {
      ...stage,
      status,
      startDate: index === 0 ? orderDate.toISOString() : undefined,
      endDate: status === "completed" ? new Date(orderTime + elapsedTime).toISOString() : undefined,
    };
  });

  return {
    stages: updatedStages,
    currentStage,
    startDate: orderDate.toISOString(),
    estimatedCompletion: deliveryDate.toISOString(),
    lastUpdated: now.toISOString(),
  };
}

/**
 * Get microgreen-specific growth stages for order items
 */
export function getMicrogreenStages(order: Order): MicrogreenStage[] {
  const now = new Date();
  const orderDate = new Date(order.createdAt);
  const deliveryDate = new Date(order.deliveryDate);
  const totalDays = Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

  return order.items.map(item => {
    // Determine current growth stage based on elapsed time
    let currentStage: MicrogreenStage["currentStage"] = "seeded";
    let stageProgress = 0;
    let daysFromSeeding = elapsedDays;

    if (elapsedDays >= totalDays) {
      currentStage = "delivered";
      stageProgress = 100;
    } else if (elapsedDays >= totalDays - 1) {
      currentStage = "harvested";
      stageProgress = 90;
    } else if (elapsedDays >= totalDays - 2) {
      currentStage = "ready";
      stageProgress = 80;
    } else if (elapsedDays >= 3) {
      currentStage = "growing";
      stageProgress = Math.min(70, (elapsedDays / totalDays) * 100);
    } else if (elapsedDays >= 1) {
      currentStage = "sprouting";
      stageProgress = Math.min(30, (elapsedDays / totalDays) * 100);
    } else {
      currentStage = "seeded";
      stageProgress = 10;
    }

    return {
      productId: item.productId,
      productName: item.name,
      currentStage,
      stageProgress,
      daysFromSeeding,
      expectedHarvestDate: deliveryDate.toISOString(),
      growthNotes: getGrowthNotes(currentStage, daysFromSeeding),
    };
  });
}

/**
 * Get contextual growth notes for each stage
 */
function getGrowthNotes(stage: MicrogreenStage["currentStage"], days: number): string {
  const notes = {
    seeded: "Seeds have been planted in premium growing medium and are beginning to germinate.",
    sprouting: `Day ${days}: First tiny sprouts are emerging from the soil. The magic is beginning!`,
    growing: `Day ${days}: Your microgreens are growing rapidly, developing their first true leaves and building up nutrients.`,
    ready: "Your microgreens have reached peak nutrition and flavor. They're being carefully harvested for you.",
    harvested: "Freshly harvested and packaged with care. Your microgreens are ready for delivery!",
    delivered: "Your microgreens have been delivered fresh and ready to enjoy."
  };

  return notes[stage] || "Growing strong and healthy!";
}

/**
 * Get personalized welcome message for returning customers
 */
export function getWelcomeBackMessage(userProfile: any, recentOrders: Order[]): {
  title: string;
  message: string;
  highlights: string[];
  actionText: string;
} {
  const totalOrders = recentOrders.length;
  const lastOrderDate = recentOrders.length > 0 ? new Date(recentOrders[0].createdAt) : null;
  const daysSinceLastOrder = lastOrderDate ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Determine welcome message based on customer history
  if (totalOrders === 0) {
    return {
      title: "Welcome to ChefPax! 🌱",
      message: "We're excited to have you join our community of fresh microgreen lovers!",
      highlights: [
        "Fresh, locally grown microgreens",
        "Weekly delivery to your door",
        "Subscribe and save 10%"
      ],
      actionText: "Start Your First Order"
    };
  } else if (totalOrders === 1) {
    return {
      title: "Welcome back! Ready for round two? 🌿",
      message: "We hope you loved your first delivery! Ready to experience the ChefPax difference again?",
      highlights: [
        "Subscribe and save 10% on future orders",
        "Earn loyalty points with every purchase",
        "Get exclusive subscriber benefits"
      ],
      actionText: "Order Again"
    };
  } else if (daysSinceLastOrder && daysSinceLastOrder > 30) {
    return {
      title: "We've missed you! 🌾",
      message: `It's been ${daysSinceLastOrder} days since your last order. Your microgreens are ready to welcome you back!`,
      highlights: [
        "Special welcome back discount",
        "New varieties available",
        "Improved growing techniques"
      ],
      actionText: "Welcome Back Special"
    };
  } else {
    return {
      title: "Welcome back, valued customer! 🌱",
      message: `You've placed ${totalOrders} orders with us - thank you for being part of the ChefPax family!`,
      highlights: [
        "Exclusive member pricing",
        "Priority delivery slots",
        "New seasonal varieties"
      ],
      actionText: "Shop Member Specials"
    };
  }
}

/**
 * Calculate delivery status with real-time updates
 */
export function getDeliveryStatus(order: Order): {
  status: string;
  message: string;
  progress: number;
  nextUpdate?: string;
  actionRequired?: string;
} {
  const now = new Date();
  const deliveryDate = new Date(order.deliveryDate);
  const orderDate = new Date(order.createdAt);
  const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (order.status === "delivered") {
    return {
      status: "delivered",
      message: "Your order has been successfully delivered!",
      progress: 100
    };
  } else if (order.status === "out_for_delivery") {
    return {
      status: "out_for_delivery",
      message: "Your microgreens are on their way! Driver is en route to your address.",
      progress: 90,
      nextUpdate: "We'll update you when your order arrives"
    };
  } else if (hoursUntilDelivery < 0) {
    return {
      status: "overdue",
      message: "Your delivery is overdue. Please contact us for assistance.",
      progress: 0,
      actionRequired: "Contact Support"
    };
  } else if (hoursUntilDelivery < 24) {
    return {
      status: "ready_soon",
      message: "Your microgreens are ready and will be delivered tomorrow!",
      progress: 80,
      nextUpdate: "Delivery window: 9:00 AM - 1:00 PM"
    };
  } else {
    const daysUntilDelivery = Math.ceil(hoursUntilDelivery / 24);
    return {
      status: "growing",
      message: `Your microgreens are growing strong! ${daysUntilDelivery} days until delivery.`,
      progress: Math.max(10, 100 - (daysUntilDelivery * 10)),
      nextUpdate: "Check back daily for growth updates"
    };
  }
}
