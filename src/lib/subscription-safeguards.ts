/**
 * Subscription Safeguards System
 * 
 * This system prevents subscription features from breaking by:
 * 1. Validating subscription endpoints exist and work
 * 2. Ensuring proper Stripe configuration
 * 3. Providing fallback mechanisms
 * 4. Logging subscription health
 */

import { getDb } from "@/lib/mongo";
import { stripe } from "@/lib/stripe";

export interface SubscriptionHealth {
  status: 'healthy' | 'degraded' | 'broken';
  issues: string[];
  lastChecked: string;
}

export interface SubscriptionSafeguards {
  checkHealth: () => Promise<SubscriptionHealth>;
  validateEndpoints: () => Promise<boolean>;
  ensureStripeConfig: () => Promise<boolean>;
  logSubscriptionEvent: (event: string, data: any) => void;
}

class SubscriptionSafeguardsImpl implements SubscriptionSafeguards {
  private healthCache: SubscriptionHealth | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async checkHealth(): Promise<SubscriptionHealth> {
    // Return cached health if still valid
    if (this.healthCache && 
        Date.now() - new Date(this.healthCache.lastChecked).getTime() < this.cacheExpiry) {
      return this.healthCache;
    }

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'broken' = 'healthy';

    try {
      // Check Stripe configuration
      if (!stripe) {
        issues.push('Stripe not configured');
        status = 'broken';
      }

      // Check database connection
      try {
        const db = await getDb();
        await db.admin().ping();
      } catch (error) {
        issues.push('Database connection failed');
        status = 'broken';
      }

      // Check subscription endpoints exist
      const endpointsValid = await this.validateEndpoints();
      if (!endpointsValid) {
        issues.push('Subscription endpoints not responding');
        status = status === 'broken' ? 'broken' : 'degraded';
      }

      // Check Stripe products exist
      if (stripe) {
        try {
          const products = await stripe.products.list({ limit: 1 });
          if (products.data.length === 0) {
            issues.push('No Stripe products found');
            status = status === 'broken' ? 'broken' : 'degraded';
          }
        } catch (error) {
          issues.push('Stripe API not accessible');
          status = 'broken';
        }
      }

    } catch (error) {
      issues.push('Health check failed');
      status = 'broken';
    }

    this.healthCache = {
      status,
      issues,
      lastChecked: new Date().toISOString()
    };

    return this.healthCache;
  }

  async validateEndpoints(): Promise<boolean> {
    try {
      // Test subscription checkout endpoint
      const response = await fetch('/api/checkout-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      // We expect a 401 (auth required) or 400 (missing data), not 500 (server error)
      return response.status !== 500;
    } catch (error) {
      console.error('Subscription endpoint validation failed:', error);
      return false;
    }
  }

  async ensureStripeConfig(): Promise<boolean> {
    if (!stripe) {
      console.error('Stripe not configured - subscriptions will fail');
      return false;
    }

    try {
      // Test Stripe connection
      await stripe.products.list({ limit: 1 });
      return true;
    } catch (error) {
      console.error('Stripe configuration invalid:', error);
      return false;
    }
  }

  logSubscriptionEvent(event: string, data: any): void {
    console.log(`[SUBSCRIPTION] ${event}:`, {
      timestamp: new Date().toISOString(),
      event,
      data: typeof data === 'object' ? JSON.stringify(data) : data
    });

    // In production, you might want to send this to a logging service
    // like Sentry, LogRocket, or your own analytics
  }
}

// Export singleton instance
export const subscriptionSafeguards = new SubscriptionSafeguardsImpl();

// Export utility functions
export const logSubscriptionEvent = (event: string, data: any) => {
  subscriptionSafeguards.logSubscriptionEvent(event, data);
};

export const checkSubscriptionHealth = async (): Promise<SubscriptionHealth> => {
  return await subscriptionSafeguards.checkHealth();
};

// Health check endpoint for monitoring
export async function GET() {
  try {
    const health = await subscriptionSafeguards.checkHealth();
    return Response.json(health);
  } catch (error) {
    return Response.json({
      status: 'broken',
      issues: ['Health check failed'],
      lastChecked: new Date().toISOString()
    }, { status: 500 });
  }
}
