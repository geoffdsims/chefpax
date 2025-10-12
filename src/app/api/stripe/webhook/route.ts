import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/mongo';
import { EmailService } from '@/lib/email-service';
import { SMSService } from '@/lib/sms-service';
import { createReservation } from '@/lib/inventory-reservation';
import { createProductionTasksFromOrder } from '@/lib/production-scheduler';

// Only initialize Stripe if configured
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check if MongoDB is configured
    let db;
    try {
      db = await getDb();
    } catch (error) {
      console.warn('MongoDB not configured, webhook will run without database operations');
      db = null;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, db);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, db);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, db);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, db);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, db);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, db);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, db);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, db: any) {
  try {
    console.log(`Payment succeeded for order: ${paymentIntent.metadata?.orderId}`);
    
    // Update order status if database is available
    if (db) {
      const updateResult = await db.collection('orders').updateOne(
        { paymentIntentId: paymentIntent.id },
        { 
          $set: { 
            status: 'confirmed',
            paymentStatus: 'paid',
            updatedAt: new Date()
          }
        }
      );
      
      // Send order confirmation email and SMS + Reserve inventory
      if (updateResult.matchedCount > 0) {
        try {
          const order = await db.collection('orders').findOne({ paymentIntentId: paymentIntent.id });
          if (order) {
            // Reserve inventory for each cart item
            for (const item of (order.cart || [])) {
              try {
                // Determine tray size from product SKU or name
                const traySize = (item.name?.includes('5×5') || item.sku?.includes('5X5')) ? '5x5' : '10x20';
                
                const reservation = await createReservation(
                  order._id.toString(),
                  item.productId,
                  item.name,
                  traySize as '10x20' | '5x5',
                  item.qty,
                  new Date(order.deliveryDate),
                  [] // Production task IDs will be added later
                );
                
                if (reservation.success) {
                  console.log(`✅ Inventory reserved: ${item.qty}× ${item.name} (${reservation.reservation?.rackName})`);
                } else {
                  console.error(`⚠️ Failed to reserve inventory for ${item.name}: ${reservation.error}`);
                  // Log but don't fail the order - manual intervention needed
                }
              } catch (resError) {
                console.error(`Error reserving inventory for ${item.name}:`, resError);
              }
            }
            
            // Send email
            await sendOrderConfirmationEmail(order);
            
            // Send SMS if customer has phone number
            if (order.customer?.phone) {
              await SMSService.sendOrderConfirmation({
                customerPhone: order.customer.phone,
                orderNumber: order._id?.toString() || 'Unknown',
                deliveryDate: order.deliveryDate || new Date().toISOString(),
                trackingUrl: `https://chefpax.com/account?order=${order._id}`
              });
            }

            // Create production tasks for each cart item
            if (order.cart && order.cart.length > 0) {
              try {
                const productionResult = await createProductionTasksFromOrder(
                  order._id.toString(),
                  order.cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    qty: item.qty,
                    sku: item.sku
                  })),
                  order.deliveryDate,
                  false // Not a subscription order
                );

                if (productionResult.success) {
                  console.log(`✅ Created ${productionResult.taskIds.length} production tasks for order ${order._id}`);
                } else {
                  console.error(`⚠️ Failed to create production tasks: ${productionResult.error}`);
                }
              } catch (prodError) {
                console.error('Error creating production tasks:', prodError);
              }
            }
          }
        } catch (error) {
          console.error('Failed to send order confirmation notifications:', error);
          // Don't fail the webhook if notifications fail
        }
      }
    } else {
      console.log('Database not available, skipping order update');
    }
    
    // Trigger order processing (without BullMQ for now)
    if (paymentIntent.metadata?.orderId) {
      console.log(`Order ${paymentIntent.metadata.orderId} ready for processing`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function sendOrderConfirmationEmail(order: any) {
  try {
    const orderData = {
      customerName: order.customer?.name || order.customer?.email || 'Customer',
      orderNumber: order._id?.toString() || 'Unknown',
      items: order.cart?.map((item: any) => ({
        name: item.name || 'Microgreens',
        quantity: item.qty || 1,
        price: (item.price || 0) / 100 // Convert cents to dollars
      })) || [],
      total: (order.totalAmount || 0) / 100, // Convert cents to dollars
      deliveryDate: order.deliveryDate || new Date().toISOString(),
      deliveryAddress: [
        order.customer?.address1,
        order.customer?.address2,
        order.customer?.city,
        order.customer?.state,
        order.customer?.zip
      ].filter(Boolean).join(', '),
      trackingUrl: `https://chefpax.com/account?order=${order._id}`
    };

    await EmailService.sendOrderConfirmation(orderData);
    console.log(`✅ Order confirmation email sent for order ${order._id}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, db: any) {
  try {
    console.log(`Payment failed for order: ${paymentIntent.metadata?.orderId}`);
    
    if (db) {
      await db.collection('orders').updateOne(
        { paymentIntentId: paymentIntent.id },
        { 
          $set: { 
            status: 'payment_failed',
            paymentStatus: 'failed',
            updatedAt: new Date()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, db: any) {
  try {
    console.log(`Subscription created: ${subscription.id}`);
    
    if (db) {
      const subscriptionData = {
        stripeSubscriptionId: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('subscriptions').insertOne(subscriptionData);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  try {
    console.log(`Subscription updated: ${subscription.id}`);
    
    if (db) {
      await db.collection('subscriptions').updateOne(
        { stripeSubscriptionId: subscription.id },
        { 
          $set: { 
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  try {
    console.log(`Subscription canceled: ${subscription.id}`);
    
    if (db) {
      await db.collection('subscriptions').updateOne(
        { stripeSubscriptionId: subscription.id },
        { 
          $set: { 
            status: 'canceled',
            updatedAt: new Date()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    
    if (db && invoice.subscription) {
      await db.collection('subscriptions').updateOne(
        { stripeSubscriptionId: invoice.subscription as string },
        { 
          $set: { 
            lastPaymentDate: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, db: any) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`);
    
    if (db && invoice.subscription) {
      await db.collection('subscriptions').updateOne(
        { stripeSubscriptionId: invoice.subscription as string },
        { 
          $set: { 
            paymentFailed: true,
            lastFailureDate: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
