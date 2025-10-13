/**
 * Facebook Conversions API for ChefPax
 * Tracks key business events for Meta (Facebook/Instagram) advertising
 */

export interface FacebookConversionEvent {
  event_name: 'Purchase' | 'AddToCart' | 'InitiateCheckout' | 'ViewContent' | 'Lead' | 'CompleteRegistration';
  event_time: number; // Unix timestamp
  user_data: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    fn?: string; // hashed first name
    ln?: string; // hashed last name
    ct?: string; // hashed city
    st?: string; // hashed state
    zp?: string; // hashed zip
    country?: string; // 2-letter country code
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
      item_price?: number;
    }>;
    num_items?: number;
  };
  event_source_url?: string;
  action_source: 'website' | 'email' | 'app';
}

export class FacebookConversions {
  private static pixelId = process.env.FACEBOOK_PIXEL_ID;
  private static accessToken = process.env.FACEBOOK_CONVERSION_API_TOKEN;
  private static apiVersion = 'v21.0';

  /**
   * Hash data using SHA-256 (Facebook requires hashed PII)
   */
  private static async hashData(data: string): Promise<string> {
    if (!data) return '';
    
    // Normalize: lowercase and trim
    const normalized = data.toLowerCase().trim();
    
    // Use Web Crypto API (available in Node.js 15+)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Track a conversion event
   */
  static async trackEvent(event: Partial<FacebookConversionEvent>): Promise<boolean> {
    // Skip if not configured
    if (!this.pixelId || !this.accessToken) {
      console.log('📊 [DEMO] Facebook Conversion:', event.event_name);
      return true;
    }

    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events`;
      
      const payload = {
        data: [{
          ...event,
          event_time: event.event_time || Math.floor(Date.now() / 1000),
          action_source: event.action_source || 'website',
        }],
        access_token: this.accessToken,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Facebook Conversions API Error:', error);
        return false;
      }

      const result = await response.json();
      console.log('✅ Facebook Conversion tracked:', event.event_name, result);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to track Facebook conversion:', error.message);
      return false;
    }
  }

  /**
   * Track purchase event
   */
  static async trackPurchase(data: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zip?: string;
    value: number;
    currency?: string;
    contentIds: string[];
    numItems: number;
  }): Promise<boolean> {
    return this.trackEvent({
      event_name: 'Purchase',
      user_data: {
        em: await this.hashData(data.email),
        ph: data.phone ? await this.hashData(data.phone) : undefined,
        fn: data.firstName ? await this.hashData(data.firstName) : undefined,
        ln: data.lastName ? await this.hashData(data.lastName) : undefined,
        ct: data.city ? await this.hashData(data.city) : undefined,
        st: data.state ? await this.hashData(data.state) : undefined,
        zp: data.zip ? await this.hashData(data.zip) : undefined,
        country: 'us',
      },
      custom_data: {
        value: data.value,
        currency: data.currency || 'USD',
        content_ids: data.contentIds,
        num_items: data.numItems,
      },
      action_source: 'website',
    });
  }

  /**
   * Track add to cart event
   */
  static async trackAddToCart(data: {
    email?: string;
    contentId: string;
    contentName: string;
    value: number;
    currency?: string;
  }): Promise<boolean> {
    return this.trackEvent({
      event_name: 'AddToCart',
      user_data: {
        em: data.email ? await this.hashData(data.email) : undefined,
      },
      custom_data: {
        content_ids: [data.contentId],
        content_name: data.contentName,
        value: data.value,
        currency: data.currency || 'USD',
      },
      action_source: 'website',
    });
  }

  /**
   * Track checkout initiation
   */
  static async trackInitiateCheckout(data: {
    email: string;
    phone?: string;
    value: number;
    currency?: string;
    contentIds: string[];
    numItems: number;
  }): Promise<boolean> {
    return this.trackEvent({
      event_name: 'InitiateCheckout',
      user_data: {
        em: await this.hashData(data.email),
        ph: data.phone ? await this.hashData(data.phone) : undefined,
      },
      custom_data: {
        value: data.value,
        currency: data.currency || 'USD',
        content_ids: data.contentIds,
        num_items: data.numItems,
      },
      action_source: 'website',
    });
  }

  /**
   * Track lead (newsletter signup, contact form, etc.)
   */
  static async trackLead(data: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> {
    return this.trackEvent({
      event_name: 'Lead',
      user_data: {
        em: await this.hashData(data.email),
        ph: data.phone ? await this.hashData(data.phone) : undefined,
        fn: data.firstName ? await this.hashData(data.firstName) : undefined,
        ln: data.lastName ? await this.hashData(data.lastName) : undefined,
      },
      action_source: 'website',
    });
  }
}

