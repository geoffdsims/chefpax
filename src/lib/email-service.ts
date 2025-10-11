/**
 * Email Service for ChefPax
 * Handles transactional emails and drip campaigns
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryDate: string;
  deliveryAddress: string;
  trackingUrl?: string;
}

export interface AbandonedCartData {
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  cartTotal: number;
  checkoutUrl: string;
}

export class EmailService {
  private static fromEmail = process.env.FROM_EMAIL || 'hello@chefpax.com';
  private static fromName = 'ChefPax Microgreens';

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    try {
      const html = this.generateOrderConfirmationHTML(data);
      const text = this.generateOrderConfirmationText(data);

      const msg: EmailTemplate = {
        to: data.customerName.includes('@') ? data.customerName : data.customerName + '@example.com', // Fallback for demo
        subject: `🍃 Your ChefPax Order #${data.orderNumber} is Confirmed!`,
        html,
        text,
      };

      if (!process.env.SENDGRID_API_KEY) {
        console.log('📧 [DEMO] Order Confirmation Email:', msg);
        return true; // Demo mode
      }

      await sgMail.send({
        ...msg,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
      });

      console.log(`✅ Order confirmation email sent to ${data.customerName}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return false;
    }
  }

  /**
   * Send abandoned cart reminder
   */
  static async sendAbandonedCartReminder(data: AbandonedCartData, reminderNumber: number = 1): Promise<boolean> {
    try {
      const subject = reminderNumber === 1 
        ? `🍃 Don't forget your fresh microgreens!` 
        : `🍃 Last chance - Your microgreens are waiting!`;

      const html = this.generateAbandonedCartHTML(data, reminderNumber);
      const text = this.generateAbandonedCartText(data, reminderNumber);

      const msg: EmailTemplate = {
        to: data.customerName.includes('@') ? data.customerName : data.customerName + '@example.com',
        subject,
        html,
        text,
      };

      if (!process.env.SENDGRID_API_KEY) {
        console.log(`📧 [DEMO] Abandoned Cart Reminder #${reminderNumber}:`, msg);
        return true; // Demo mode
      }

      await sgMail.send({
        ...msg,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
      });

      console.log(`✅ Abandoned cart reminder #${reminderNumber} sent to ${data.customerName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send abandoned cart reminder #${reminderNumber}:`, error);
      return false;
    }
  }

  /**
   * Send welcome email for new subscribers
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const html = this.generateWelcomeHTML(name);
      const text = this.generateWelcomeText(name);

      const msg: EmailTemplate = {
        to: email,
        subject: `🍃 Welcome to ChefPax - Your Fresh Microgreens Journey Begins!`,
        html,
        text,
      };

      if (!process.env.SENDGRID_API_KEY) {
        console.log('📧 [DEMO] Welcome Email:', msg);
        return true; // Demo mode
      }

      await sgMail.send({
        ...msg,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
      });

      console.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send delivery reminder
   */
  static async sendDeliveryReminder(email: string, name: string, deliveryDate: string, trackingUrl?: string): Promise<boolean> {
    try {
      const html = this.generateDeliveryReminderHTML(name, deliveryDate, trackingUrl);
      const text = this.generateDeliveryReminderText(name, deliveryDate, trackingUrl);

      const msg: EmailTemplate = {
        to: email,
        subject: `🍃 Your microgreens delivery is coming tomorrow!`,
        html,
        text,
      };

      if (!process.env.SENDGRID_API_KEY) {
        console.log('📧 [DEMO] Delivery Reminder:', msg);
        return true; // Demo mode
      }

      await sgMail.send({
        ...msg,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
      });

      console.log(`✅ Delivery reminder sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send delivery reminder:', error);
      return false;
    }
  }

  // HTML Template Generators
  private static generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2D5016; }
          .item { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-weight: bold; font-size: 18px; color: #2D5016; }
          .button { display: inline-block; background: #2D5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍃 ChefPax Order Confirmed!</h1>
            <p>Thank you for choosing ChefPax Microgreens</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>Your order has been confirmed and is being prepared for delivery.</p>
            
            <div class="order-details">
              <h3>Order #${data.orderNumber}</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} (×${item.quantity})</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <hr>
              <div class="item total">
                <span>Total</span>
                <span>$${data.total.toFixed(2)}</span>
              </div>
            </div>

            <div class="order-details">
              <h3>Delivery Information</h3>
              <p><strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>
              <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
              ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" class="button">Track Your Order</a></p>` : ''}
            </div>

            <p>We'll send you a text message when your order is on its way!</p>
            <p>Questions? Reply to this email or call us at (512) 555-0123</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateAbandonedCartHTML(data: AbandonedCartData, reminderNumber: number): string {
    const urgency = reminderNumber > 1 ? 'urgent' : 'friendly';
    const message = reminderNumber === 1 
      ? "Don't forget your fresh microgreens are waiting in your cart!"
      : "This is your final reminder - your microgreens are still waiting!";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Complete Your Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${urgency === 'urgent' ? '#d32f2f' : '#2D5016'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .item { display: flex; align-items: center; margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
          .item-image { width: 60px; height: 60px; background: #e8f5e8; border-radius: 5px; margin-right: 15px; }
          .item-details { flex: 1; }
          .button { display: inline-block; background: #2D5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍃 ${message}</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.customerName}!</h2>
            <p>We noticed you left some delicious microgreens in your cart. Complete your order now and get fresh, local microgreens delivered to your door!</p>
            
            <h3>Your Cart Items:</h3>
            ${data.items.map(item => `
              <div class="item">
                <div class="item-image"></div>
                <div class="item-details">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            `).join('')}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.checkoutUrl}" class="button">Complete Your Order - $${data.cartTotal.toFixed(2)}</a>
            </div>
            
            <p><strong>Why choose ChefPax?</strong></p>
            <ul>
              <li>🌱 Grown locally in Austin</li>
              <li>🚚 Same-day delivery available</li>
              <li>💯 Fresh picked daily</li>
              <li>🏆 Chef-grade quality</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateWelcomeHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ChefPax</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5016; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .benefit { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2D5016; }
          .button { display: inline-block; background: #2D5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍃 Welcome to ChefPax!</h1>
            <p>Your fresh microgreens journey starts now</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Welcome to ChefPax - Austin's premier microgreens delivery service! We're thrilled to have you join our community of health-conscious food lovers.</p>
            
            <div class="benefit">
              <h3>🌱 What makes ChefPax special?</h3>
              <p>We grow premium microgreens locally in Austin, delivering farm-fresh greens directly to your door. Our microgreens are harvested at peak nutrition and delivered within hours of picking.</p>
            </div>

            <div class="benefit">
              <h3>🚚 Convenient Delivery</h3>
              <p>Choose your delivery day and we'll bring fresh microgreens right to your doorstep. Same-day delivery available for orders placed before 2 PM.</p>
            </div>

            <div class="benefit">
              <h3>💯 Chef-Grade Quality</h3>
              <p>Our microgreens are grown to restaurant standards, perfect for home chefs and health enthusiasts alike.</p>
            </div>

            <div style="text-align: center;">
              <a href="https://chefpax.com/shop" class="button">Shop Fresh Microgreens</a>
            </div>

            <p>Have questions? We're here to help! Reply to this email or call us at (512) 555-0123.</p>
            <p>Happy growing!</p>
            <p>The ChefPax Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateDeliveryReminderHTML(name: string, deliveryDate: string, trackingUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Delivery Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2D5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍃 Your Delivery is Coming Tomorrow!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Great news! Your fresh microgreens will be delivered tomorrow (${new Date(deliveryDate).toLocaleDateString()}).</p>
            
            <p>Please ensure someone is available to receive your order, or leave delivery instructions if you won't be home.</p>
            
            ${trackingUrl ? `<p><a href="${trackingUrl}" class="button">Track Your Delivery</a></p>` : ''}
            
            <p>We'll send you a text message when your order is out for delivery!</p>
            <p>Questions? Reply to this email or call us at (512) 555-0123</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Text Template Generators (fallback for email clients that don't support HTML)
  private static generateOrderConfirmationText(data: OrderConfirmationData): string {
    return `
Order Confirmation - ChefPax Microgreens

Hello ${data.customerName}!

Your order #${data.orderNumber} has been confirmed.

Items:
${data.items.map(item => `- ${item.name} (×${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: $${data.total.toFixed(2)}

Delivery Information:
Date: ${new Date(data.deliveryDate).toLocaleDateString()}
Address: ${data.deliveryAddress}

${data.trackingUrl ? `Track your order: ${data.trackingUrl}` : ''}

We'll send you a text message when your order is on its way!

Questions? Call us at (512) 555-0123

The ChefPax Team
    `.trim();
  }

  private static generateAbandonedCartText(data: AbandonedCartData, reminderNumber: number): string {
    return `
Don't forget your fresh microgreens!

Hi ${data.customerName},

You left some delicious microgreens in your cart:

${data.items.map(item => `- ${item.name} (×${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: $${data.cartTotal.toFixed(2)}

Complete your order: ${data.checkoutUrl}

Why choose ChefPax?
- Grown locally in Austin
- Same-day delivery available  
- Fresh picked daily
- Chef-grade quality

The ChefPax Team
    `.trim();
  }

  private static generateWelcomeText(name: string): string {
    return `
Welcome to ChefPax Microgreens!

Hi ${name},

Welcome to ChefPax - Austin's premier microgreens delivery service!

What makes ChefPax special?
- We grow premium microgreens locally in Austin
- Delivered farm-fresh greens directly to your door
- Harvested at peak nutrition
- Delivered within hours of picking
- Chef-grade quality for home chefs and health enthusiasts

Shop now: https://chefpax.com/shop

Have questions? Call us at (512) 555-0123

Happy growing!
The ChefPax Team
    `.trim();
  }

  private static generateDeliveryReminderText(name: string, deliveryDate: string, trackingUrl?: string): string {
    return `
Your microgreens delivery is coming tomorrow!

Hi ${name},

Your fresh microgreens will be delivered tomorrow (${new Date(deliveryDate).toLocaleDateString()}).

Please ensure someone is available to receive your order, or leave delivery instructions if you won't be home.

${trackingUrl ? `Track your delivery: ${trackingUrl}` : ''}

We'll send you a text message when your order is out for delivery!

Questions? Call us at (512) 555-0123

The ChefPax Team
    `.trim();
  }
}
