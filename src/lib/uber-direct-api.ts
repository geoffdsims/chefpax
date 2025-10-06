/**
 * Uber Direct API Integration
 * Handles same-day delivery requests for live microgreen trays
 */

export class UberDirectAPI {
  private clientId: string;
  private clientSecret: string;
  private customerId: string;
  private baseUrl = 'https://api.uber.com/v1';
  private accessToken: string | null = null;

  constructor(clientId: string, clientSecret: string, customerId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.customerId = customerId;
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'delivery'
        })
      });

      if (!response.ok) {
        throw new Error(`Uber OAuth error: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Uber access token:', error);
      throw error;
    }
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
      country: string;
      lat?: number;
      lng?: number;
    };
    dropoffAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      lat?: number;
      lng?: number;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    pickupTime?: string;
    dropoffTime?: string;
    specialInstructions?: string;
  }): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const deliveryRequest = {
        pickup: {
          address: deliveryData.pickupAddress,
          ...(deliveryData.pickupTime && { pickup_time: deliveryData.pickupTime }),
          special_instructions: deliveryData.specialInstructions || 'Live microgreen trays - handle with care'
        },
        dropoff: {
          address: deliveryData.dropoffAddress,
          ...(deliveryData.dropoffTime && { dropoff_time: deliveryData.dropoffTime })
        },
        items: deliveryData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: Math.round(item.price * 100) // Convert to cents
        }))
      };

      const response = await fetch(`${this.baseUrl}/customers/${this.customerId}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Uber Direct API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Uber Direct delivery created:', result);
      return result;
    } catch (error) {
      console.error('Error creating Uber Direct delivery:', error);
      throw error;
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(deliveryId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/customers/${this.customerId}/deliveries/${deliveryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Uber Direct API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting delivery status:', error);
      throw error;
    }
  }

  /**
   * Cancel a delivery
   */
  async cancelDelivery(deliveryId: string, reason?: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/customers/${this.customerId}/deliveries/${deliveryId}/cancel`, {
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
        throw new Error(`Uber Direct API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling delivery:', error);
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
        }
      };

      const response = await fetch(`${this.baseUrl}/customers/${this.customerId}/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteRequest)
      });

      if (!response.ok) {
        throw new Error(`Uber Direct API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting delivery quote:', error);
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
      // For now, return estimated values based on typical Uber Direct pricing
      // In production, you'd use the actual quote API
      const baseCost = 8.50; // Base delivery cost
      const distanceMultiplier = 0.50; // Per mile
      const liveTraySurcharge = 2.00; // Special handling for live trays
      
      // Estimate based on typical local delivery distances
      const estimatedCost = baseCost + (5 * distanceMultiplier) + liveTraySurcharge;
      const estimatedTime = 45; // Minutes

      return {
        estimatedCost: Math.round(estimatedCost * 100) / 100,
        estimatedTime,
        available: true
      };
    } catch (error) {
      console.error('Error estimating delivery:', error);
      throw error;
    }
  }
}
