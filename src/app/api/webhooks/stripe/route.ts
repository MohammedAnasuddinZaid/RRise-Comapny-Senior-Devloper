/**
 * Stripe Webhook Handler
 * 
 * This API route handles Stripe webhook events to update user plan state in Supabase.
 * 
 * IMPORTANT SECURITY NOTES:
 * - This endpoint uses the service role key to bypass RLS for plan updates
 * - Webhook signature verification is required to prevent fraudulent requests
 * - Plan state must always come from Supabase, never from frontend values
 * - Stripe webhooks are the only trusted source for billing state changes
 * 
 * Supported Events:
 * - checkout.session.completed: Initial subscription purchase
 * - customer.subscription.created: New subscription created
 * - customer.subscription.updated: Subscription plan changed or renewed
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_failed: Payment failed (may need to downgrade plan)
 * 
 * Plan Mapping:
 * - price_id starting with 'price_pro_' -> pro plan
 * - price_id starting with 'price_ultra_' -> ultra plan
 * - free plan is default
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with secret key (with fallback check)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Initialize Supabase with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Map Stripe price ID to plan type
 */
function getPlanFromPriceId(priceId: string): 'free' | 'pro' | 'ultra' {
  if (priceId === process.env.STRIPE_PRICE_PRO || priceId === 'price_1ToJGuIaxTgHtJYBAFVh6s4M') return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ULTRA || priceId === 'price_1ToJJVIaxTgHtJYBa2rkDBDo') return 'ultra';
  return 'free';
}

/**
 * Handle checkout.session.completed event
 * This is triggered when a user completes a checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const priceId = session.subscription ? 
    (session.subscription as Stripe.Subscription).items.data[0].price.id : 
    session.metadata?.price_id;

  if (!userId || !priceId) {
    console.error('Missing user_id or price_id in checkout session');
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  
  // Update user plan in Supabase
  const { error } = await supabase
    .from('profiles')
    .update({ 
      plan,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user plan after checkout:', error);
    throw error;
  }

  console.log(`Updated user ${userId} to plan ${plan} after checkout`);
}

/**
 * Handle customer.subscription.created event
 * This is triggered when a new subscription is created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  if (!stripe) return;
  // Get user_id from customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  const userId = (customer as Stripe.Customer).metadata?.user_id;

  if (!userId) {
    console.error('Missing user_id in customer metadata');
    return;
  }

  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  
  // Update user plan in Supabase
  const { error } = await supabase
    .from('profiles')
    .update({ 
      plan,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user plan after subscription created:', error);
    throw error;
  }

  console.log(`Updated user ${userId} to plan ${plan} after subscription created`);
}

/**
 * Handle customer.subscription.updated event
 * This is triggered when a subscription is updated (plan change, renewal)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  if (!stripe) {
    console.error('Stripe client is not initialized');
    return;
  }
  
  // Get user_id from customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  const userId = (customer as Stripe.Customer).metadata?.user_id;

  if (!userId) {
    console.error('Missing user_id in customer metadata');
    return;
  }

  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  
  // Update user plan in Supabase
  const { error } = await supabase
    .from('profiles')
    .update({ 
      plan,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user plan after subscription updated:', error);
    throw error;
  }

  console.log(`Updated user ${userId} to plan ${plan} after subscription updated`);
}

/**
 * Handle customer.subscription.deleted event
 * This is triggered when a subscription is cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  if (!stripe) {
    console.error('Stripe client is not initialized');
    return;
  }
  
  // Get user_id from customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  const userId = (customer as Stripe.Customer).metadata?.user_id;

  if (!userId) {
    console.error('Missing user_id in customer metadata');
    return;
  }
  
  // Downgrade user to free plan in Supabase
  const { error } = await supabase
    .from('profiles')
    .update({ 
      plan: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error downgrading user plan after subscription deleted:', error);
    throw error;
  }

  console.log(`Downgraded user ${userId} to free plan after subscription deleted`);
}

/**
 * Handle invoice.payment_failed event
 * This is triggered when a payment fails
 * For now, we'll just log it. In production, you might want to:
 * - Send notification to user
 * - Retry payment
 * - Downgrade plan after multiple failures
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  if (!stripe) {
    console.error('Stripe client is not initialized');
    return;
  }
  
  // Get user_id from customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  const userId = (customer as Stripe.Customer).metadata?.user_id;

  if (!userId) {
    console.error('Missing user_id in customer metadata');
    return;
  }

  console.log(`Payment failed for user ${userId}, invoice ${invoice.id}`);
  
  // TODO: Implement payment failure handling logic
  // - Send email notification
  // - Track failed payment count
  // - Downgrade plan after N failures
}

/**
 * Main webhook handler
 */
export async function POST(request: Request) {
  if (!stripe) {
    return new NextResponse('Stripe not configured', { status: 503 });
  }

  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return new NextResponse('Missing stripe-signature', { status: 400 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
