/**
 * SMS Service for ChefPax
 * Handles transactional SMS notifications via Twilio
 */

import twilio from 'twilio';
import type { Twilio } from 'twilio';

// Initialize Twilio client only if credentials are available
let twilioClient: ReturnType<typeof twilio> | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+18556875045'; // ChefPax verified toll-free

export interface OrderConfirmationSMSData {
  customerPhone: string;
  orderNumber: string;
  deliveryDate: string;
  trackingUrl?: string;
}

export interface DeliveryUpdateSMSData {
  customerPhone: string;
  orderNumber: string;
  status: 'out_for_delivery' | 'delivered' | 'delayed';
  estimatedTime?: string;
  trackingUrl?: string;
}

export interface LowStockAlertSMSData {
  adminPhone: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

export class SMSService {
  /**
   * Send order confirmation SMS
   */
  static async sendOrderConfirmation(data: OrderConfirmationSMSData): Promise<boolean> {
    try {
      const message = `🌱 ChefPax: Order #${data.orderNumber} confirmed! Your fresh microgreens will be delivered ${new Date(data.deliveryDate).toLocaleDateString()}.${data.trackingUrl ? ` Track: ${data.trackingUrl}` : ''} Reply STOP to opt-out.`;

      return await this.sendSMS(data.customerPhone, message);
    } catch (error) {
      console.error('❌ Failed to send order confirmation SMS:', error);
      return false;
    }
  }

  /**
   * Send delivery update SMS
   */
  static async sendDeliveryUpdate(data: DeliveryUpdateSMSData): Promise<boolean> {
    try {
      let message = '';
      
      switch (data.status) {
        case 'out_for_delivery':
          message = `🚚 ChefPax: Your order #${data.orderNumber} is out for delivery!${data.estimatedTime ? ` ETA: ${data.estimatedTime}` : ''}${data.trackingUrl ? ` Track: ${data.trackingUrl}` : ''}`;
          break;
        case 'delivered':
          message = `✅ ChefPax: Your order #${data.orderNumber} has been delivered! Enjoy your fresh microgreens! 🌱`;
          break;
        case 'delayed':
          message = `⏰ ChefPax: Your order #${data.orderNumber} is experiencing a slight delay.${data.estimatedTime ? ` New ETA: ${data.estimatedTime}` : ''} We apologize for the inconvenience.`;
          break;
      }

      return await this.sendSMS(data.customerPhone, message);
    } catch (error) {
      console.error('❌ Failed to send delivery update SMS:', error);
      return false;
    }
  }

  /**
   * Send low stock alert to admin
   */
  static async sendLowStockAlert(data: LowStockAlertSMSData): Promise<boolean> {
    try {
      const message = `⚠️ ChefPax LOW STOCK ALERT: ${data.productName} is at ${data.currentStock} units (threshold: ${data.threshold}). Please restock soon!`;

      return await this.sendSMS(data.adminPhone, message);
    } catch (error) {
      console.error('❌ Failed to send low stock alert SMS:', error);
      return false;
    }
  }

  /**
   * Send delivery reminder (1 day before)
   */
  static async sendDeliveryReminder(customerPhone: string, orderNumber: string, deliveryDate: string): Promise<boolean> {
    try {
      const message = `🍃 ChefPax: Reminder - Your order #${orderNumber} will be delivered tomorrow (${new Date(deliveryDate).toLocaleDateString()})! Make sure someone is available to receive your fresh microgreens.`;

      return await this.sendSMS(customerPhone, message);
    } catch (error) {
      console.error('❌ Failed to send delivery reminder SMS:', error);
      return false;
    }
  }

  /**
   * Send harvest notification
   */
  static async sendHarvestNotification(customerPhone: string, productName: string): Promise<boolean> {
    try {
      const message = `🌱 ChefPax: Fresh ${productName} just harvested! Place your order now for same-day delivery. Order at https://chefpax.com/shop`;

      return await this.sendSMS(customerPhone, message);
    } catch (error) {
      console.error('❌ Failed to send harvest notification SMS:', error);
      return false;
    }
  }

  /**
   * Core SMS sending function
   */
  private static async sendSMS(to: string, message: string): Promise<boolean> {
    // Demo mode if Twilio is not configured
    if (!twilioClient) {
      console.log('📱 [DEMO] SMS:', {
        to,
        from: twilioPhoneNumber,
        message
      });
      return true;
    }

    try {
      // Validate phone number format (basic check)
      const cleanedPhone = to.replace(/[^\d+]/g, '');
      if (!cleanedPhone.startsWith('+')) {
        throw new Error('Phone number must include country code (e.g., +1 for US)');
      }

      const result = await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: cleanedPhone
      });

      console.log(`✅ SMS sent successfully! SID: ${result.sid}`);
      return true;
    } catch (error: any) {
      console.error('❌ Twilio SMS Error:', error.message || error);
      console.error('Error details:', error);
      // If toll-free verification is pending, log helpful message
      if (error.message?.includes('toll') || error.message?.includes('verification')) {
        console.log('💡 Toll-free number verification may be in progress. Consider using a local number for immediate SMS access.');
      }
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    // Basic validation - should start with + and contain 10-15 digits
    const cleaned = phone.replace(/[^\d+]/g, '');
    return /^\+\d{10,15}$/.test(cleaned);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    // US phone number formatting
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return as-is if not standard US format
  }

  /**
   * Send opt-in confirmation message
   */
  static async sendOptInConfirmation(customerPhone: string): Promise<boolean> {
    try {
      const message = `Welcome to ChefPax! 🌱 You'll now receive SMS updates for your orders and deliveries. Reply HELP for assistance or STOP to opt-out. Msg & data rates may apply. chefpax.com/sms-opt-in`;

      return await this.sendSMS(customerPhone, message);
    } catch (error) {
      console.error('❌ Failed to send opt-in confirmation SMS:', error);
      return false;
    }
  }

  /**
   * Handle incoming SMS (for STOP, HELP, START keywords)
   * This should be called from a Twilio webhook endpoint
   */
  static async handleIncomingSMS(from: string, body: string): Promise<string> {
    const normalizedBody = body.trim().toUpperCase();

    switch (normalizedBody) {
      case 'STOP':
      case 'UNSUBSCRIBE':
      case 'CANCEL':
        // TODO: Update user SMS preferences in database
        return 'You have been unsubscribed from ChefPax SMS notifications. Reply START to re-subscribe.';

      case 'START':
      case 'SUBSCRIBE':
      case 'YES':
      case 'JOIN':
        // TODO: Update user SMS preferences in database
        return 'Welcome back to ChefPax SMS notifications! 🌱 Reply STOP to opt-out.';

      case 'HELP':
      case 'INFO':
        return 'ChefPax Help: We send order confirmations, delivery updates, and subscription reminders. Visit chefpax.com/sms-opt-in for details. Reply STOP to opt-out or contact alerts@chefpax.com for support.';

      default:
        return 'Thanks for your message! For order support, visit chefpax.com/account or email alerts@chefpax.com. Reply HELP for options or STOP to opt-out.';
    }
  }

  /**
   * Check Twilio number capabilities (voice, SMS, MMS)
   */
  static async checkNumberCapabilities(): Promise<{
    voice: boolean;
    sms: boolean;
    mms: boolean;
    phoneNumber: string;
  } | null> {
    if (!twilioClient) {
      console.log('⚠️  Twilio not configured');
      return null;
    }

    try {
      const numbers = await twilioClient.incomingPhoneNumbers.list({ 
        phoneNumber: twilioPhoneNumber 
      });

      if (numbers.length === 0) {
        console.log('⚠️  Phone number not found in Twilio account');
        return null;
      }

      const number = numbers[0];
      return {
        voice: number.capabilities?.voice || false,
        sms: number.capabilities?.sms || false,
        mms: number.capabilities?.mms || false,
        phoneNumber: number.phoneNumber
      };
    } catch (error: any) {
      console.error('❌ Failed to check number capabilities:', error.message);
      return null;
    }
  }
}

