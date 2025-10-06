import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/mongo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const db = await getDb();

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
    await db.collection('orders').updateOne(
      { paymentIntentId: paymentIntent.id },
      { 
        $set: { 
          status: 'confirmed',
          paymentStatus: 'paid',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Payment succeeded for order: ${paymentIntent.metadata?.orderId}`);
    
    // Trigger order processing (without BullMQ for now)
    if (paymentIntent.metadata?.orderId) {
      console.log(`Order ${paymentIntent.metadata.orderId} ready for processing`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, db: any) {
  try {
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
    
    console.log(`Payment failed for order: ${paymentIntent.metadata?.orderId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, db: any) {
  try {
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
    console.log(`Subscription created: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  try {
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
    
    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  try {
    await db.collection('subscriptions').updateOne(
      { stripeSubscriptionId: subscription.id },
      { 
        $set: { 
          status: 'canceled',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  try {
    if (invoice.subscription) {
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
    
    console.log(`Invoice payment succeeded: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, db: any) {
  try {
    if (invoice.subscription) {
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
    
    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
