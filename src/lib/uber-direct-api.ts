/**
 * Uber Direct API Integration for ChefPax
 * Handles automated delivery scheduling
 */

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  unit?: string;
}

export interface DeliveryRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  deliveryInstructions?: string;
  scheduledTime?: Date;
}

export interface DeliveryResult {
  success: boolean;
  deliveryId?: string;
  trackingUrl?: string;
  estimatedPickup?: string;
  estimatedDelivery?: string;
  cost?: number;
  error?: string;
}

export class UberDirectAPI {
  private clientId: string;
  private clientSecret: string;
  private customerId: string;
  private apiUrl = 'https://api.uber.com/v1/customers';

  constructor(clientId: string, clientSecret: string, customerId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.customerId = customerId;
  }

  /**
   * Create a delivery
   */
  async createDelivery(request: DeliveryRequest): Promise<DeliveryResult> {
    try {
      const accessToken = await this.getAccessToken();

      const deliveryPayload = {
        pickup: {
          name: 'ChefPax Microgreens',
          address: this.formatAddress(request.pickupAddress),
          phone_number: process.env.CHEFPAX_PHONE || '+15125550100',
          instructions: 'Please pick up fresh microgreens. Handle with care.'
        },
        dropoff: {
          name: request.customerName,
          address: this.formatAddress(request.deliveryAddress),
          phone_number: request.customerPhone,
          instructions: request.deliveryInstructions || 'Please deliver to door'
        },
        manifest: {
          reference: request.orderId,
          description: `ChefPax Order ${request.orderId}`,
          items: request.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            size: 'medium'
          }))
        },
        ...(request.scheduledTime && {
          pickup_ready: new Date().toISOString(),
          pickup_deadline: request.scheduledTime.toISOString(),
          dropoff_deadline: new Date(request.scheduledTime.getTime() + 7200000).toISOString() // 2 hours later
        })
      };

      const response = await fetch(`${this.apiUrl}/${this.customerId}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deliveryPayload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create delivery');
      }

      const data = await response.json();

      return {
        success: true,
        deliveryId: data.id,
        trackingUrl: data.tracking_url,
        estimatedPickup: data.pickup_eta,
        estimatedDelivery: data.dropoff_eta,
        cost: data.quote?.amount
      };
    } catch (error: any) {
      console.error('Uber Direct API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create delivery'
      };
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(deliveryId: string): Promise<{
    status: string;
    location?: { lat: number; lng: number };
    estimatedDelivery?: string;
  }> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}/${this.customerId}/deliveries/${deliveryId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get delivery status');
      }

      const data = await response.json();

      return {
        status: data.status,
        location: data.courier?.location,
        estimatedDelivery: data.dropoff_eta
      };
    } catch (error: any) {
      console.error('Failed to get delivery status:', error);
      throw error;
    }
  }

  /**
   * Cancel a delivery
   */
  async cancelDelivery(deliveryId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}/${this.customerId}/deliveries/${deliveryId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error: any) {
      console.error('Failed to cancel delivery:', error);
      return false;
    }
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const response = await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        scope: 'eats.deliveries'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get Uber Direct access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Format address for Uber API
   */
  private formatAddress(address: DeliveryAddress): string {
    const parts = [
      address.street,
      address.unit,
      address.city,
      address.state,
      address.zip,
      address.country || 'US'
    ].filter(Boolean);

    return parts.join(', ');
  }
}

/**
 * Create Uber Direct API instance from environment variables
 */
export function createUberDirectAPI(): UberDirectAPI | null {
  const clientId = process.env.UBER_DIRECT_CLIENT_ID;
  const clientSecret = process.env.UBER_DIRECT_CLIENT_SECRET;
  const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;

  if (!clientId || !clientSecret || !customerId) {
    console.warn('Uber Direct API not configured');
    return null;
  }

  return new UberDirectAPI(clientId, clientSecret, customerId);
}
