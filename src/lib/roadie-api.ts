/**
 * Roadie API Integration
 * Handles same-day delivery requests via crowdsourced drivers
 */

export class RoadieAPI {
  private customerId: string;
  private baseUrl = 'https://api.roadie.com';
  private accessToken: string | null = null;

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  /**
   * Get OAuth access token (Roadie uses API key authentication)
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    // Roadie typically uses API key authentication
    // You'll need to get your API key from Roadie Business portal
    this.accessToken = process.env.ROADIE_API_KEY || '';
    return this.accessToken;
  }

  /**
   * Create a delivery request
   */
  async createDelivery(deliveryData: {
    pickupAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country?: string;
      lat?: number;
      lng?: number;
    };
    dropoffAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country?: string;
      lat?: number;
      lng?: number;
    };
    items: Array<{
      name: string;
      quantity: number;
      weight?: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
    }>;
    pickupTime?: string;
    dropoffTime?: string;
    specialInstructions?: string;
    value?: number;
  }): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const deliveryRequest = {
        customer_id: this.customerId,
        pickup: {
          address: deliveryData.pickupAddress,
          ...(deliveryData.pickupTime && { pickup_time: deliveryData.pickupTime }),
          special_instructions: deliveryData.specialInstructions || 'Live microgreen trays - handle with care, keep upright'
        },
        dropoff: {
          address: deliveryData.dropoffAddress,
          ...(deliveryData.dropoffTime && { dropoff_time: deliveryData.dropoffTime })
        },
        items: deliveryData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          weight: item.weight || 2, // Live trays are lightweight
          dimensions: item.dimensions || {
            length: 12,
            width: 8,
            height: 4
          }
        })),
        value: deliveryData.value || 25.00,
        description: 'Live microgreen trays for home growing'
      };

      const response = await fetch(`${this.baseUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Roadie API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Roadie delivery created:', result);
      return result;
    } catch (error) {
      console.error('Error creating Roadie delivery:', error);
      throw error;
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(deliveryId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/deliveries/${deliveryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Roadie API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Roadie delivery status:', error);
      throw error;
    }
  }

  /**
   * Cancel a delivery
   */
  async cancelDelivery(deliveryId: string, reason?: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/deliveries/${deliveryId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Customer requested cancellation'
        })
      });

      if (!response.ok) {
        throw new Error(`Roadie API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling Roadie delivery:', error);
      throw error;
    }
  }

  /**
   * Get delivery quotes
   */
  async getDeliveryQuote(quoteData: {
    pickupAddress: {
      lat: number;
      lng: number;
    };
    dropoffAddress: {
      lat: number;
      lng: number;
    };
    pickupTime?: string;
    items?: Array<{
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
    }>;
  }): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const quoteRequest = {
        pickup: {
          address: quoteData.pickupAddress,
          ...(quoteData.pickupTime && { pickup_time: quoteData.pickupTime })
        },
        dropoff: {
          address: quoteData.dropoffAddress
        },
        items: quoteData.items || [{
          weight: 2,
          dimensions: {
            length: 12,
            width: 8,
            height: 4
          }
        }]
      };

      const response = await fetch(`${this.baseUrl}/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteRequest)
      });

      if (!response.ok) {
        throw new Error(`Roadie API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Roadie delivery quote:', error);
      throw error;
    }
  }

  /**
   * Estimate delivery cost for live microgreen trays
   */
  async estimateMicrogreenDelivery(pickupAddress: string, dropoffAddress: string): Promise<{
    estimatedCost: number;
    estimatedTime: number;
    available: boolean;
  }> {
    try {
      // Roadie typically has competitive pricing for local deliveries
      // Live microgreen trays are lightweight and small, perfect for Roadie
      const baseCost = 7.00; // Base delivery cost (typically lower than Uber Direct)
      const distanceMultiplier = 0.40; // Per mile (Roadie is often cheaper)
      const liveTraySurcharge = 1.50; // Special handling for live trays
      
      // Estimate based on typical local delivery distances
      const estimatedCost = baseCost + (5 * distanceMultiplier) + liveTraySurcharge;
      const estimatedTime = 60; // Minutes (Roadie may take slightly longer due to crowdsourcing)

      return {
        estimatedCost: Math.round(estimatedCost * 100) / 100,
        estimatedTime,
        available: true
      };
    } catch (error) {
      console.error('Error estimating Roadie delivery:', error);
      throw error;
    }
  }
}
