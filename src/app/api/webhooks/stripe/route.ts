/**
 * Stripe Webhook Handler
 *
 * Single source of truth for billing state changes. Stripe webhooks are the
 * ONLY place that writes plan state (profiles.plan) and subscription records.
 *
 * Security notes:
 * - Webhook signature is verified with STRIPE_WEBHOOK_SECRET (env), falling
 *   back to `stripe_webhook_secret` in system_settings.
 * - Uses the service role key (bypasses RLS) for trusted writes.
 *
 * Supported events:
 * - checkout.session.completed  → record payment, sync subscription
 * - customer.subscription.created → sync subscription + plan
 * - customer.subscription.updated → sync subscription + plan (incl. cancel_at_period_end)
 * - customer.subscription.deleted → downgrade plan to free
 * - invoice.paid                 → record payment
 * - invoice.payment_failed       → log + mark subscription past_due
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { stripeConfig } from '@/lib/env';

const DEFAULT_PRICE_PRO = 'price_1ToJGuIaxTgHtJYBAFVh6s4M';
const DEFAULT_PRICE_ULTRA = 'price_1ToJJVIaxTgHtJYBa2rkDBDo';

type Plan = 'free' | 'pro' | 'ultra';

/**
 * Fetch price ID → plan mapping overrides from system_settings (optional).
 */
async function getPriceOverrides(): Promise<Record<string, string>> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('system_settings')
      .select('key, value')
      .in('key', ['stripe_pro_price_id', 'stripe_ultra_price_id']);
    const map: Record<string, string> = {};
    (data ?? []).forEach((s: { key: string; value: string | null }) => {
      if (s.value != null) {
        map[s.key] = s.value;
      }
    });
    return map;
  } catch (error) {
    console.error('[webhook] Error fetching price overrides:', error);
    return {};
  }
}

/**
 * Map a Stripe price ID to a plan, using env + optional DB overrides.
 */
async function resolvePlan(priceId: string | undefined | null): Promise<Plan> {
  if (!priceId) return 'free';
  const overrides = await getPriceOverrides();
  const proIds = [stripeConfig.pricePro || DEFAULT_PRICE_PRO, overrides.stripe_pro_price_id].filter(Boolean);
  const ultraIds = [stripeConfig.priceUltra || DEFAULT_PRICE_ULTRA, overrides.stripe_ultra_price_id].filter(Boolean);
  if (proIds.includes(priceId)) return 'pro';
  if (ultraIds.includes(priceId)) return 'ultra';
  return 'free';
}

/**
 * Resolve the RRise user_id from a Stripe customer (via customer metadata).
 */
async function getUserIdFromCustomer(customerId: string | null): Promise<string | null> {
  if (!customerId) return null;
  try {
    const customer = (await getStripe().customers.retrieve(customerId)) as Stripe.Customer;
    return customer?.metadata?.user_id || null;
  } catch (error) {
    console.error('[webhook] Error retrieving customer metadata:', error);
    return null;
  }
}

/**
 * Sync a Stripe subscription into the `subscriptions` table and update the
 * user's plan on `profiles`.
 */
async function syncSubscription(subscription: Stripe.Subscription): Promise<void> {
  const userId = await getUserIdFromCustomer(subscription.customer as string);
  if (!userId) {
    console.error('[webhook] Missing user_id for customer', subscription.customer);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const activeStatuses = new Set(['active', 'trialing']);
  const plan: Plan = activeStatuses.has(subscription.status)
    ? await resolvePlan(priceId)
    : 'free';

  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : null,
    stripe_price_id: priceId ?? null,
    plan,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: item?.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    current_period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
    updated_at: now,
  };

  const { error: subError } = await getSupabaseAdmin()
    .from('subscriptions')
    .upsert(row, { onConflict: 'stripe_subscription_id' });

  if (subError) {
    console.error('[webhook] Error upserting subscription:', subError);
  }

  const { error: profileError } = await getSupabaseAdmin()
    .from('profiles')
    .update({ plan, updated_at: now })
    .eq('id', userId);

  if (profileError) {
    console.error('[webhook] Error updating profile plan:', profileError);
  }

  console.log(`[webhook] Synced user ${userId} → plan ${plan} (status ${subscription.status})`);
}

/**
 * Record a successful payment into the `payments` table.
 */
async function recordPayment(invoice: Stripe.Invoice): Promise<void> {
  const userId = await getUserIdFromCustomer(invoice.customer as string);
  if (!userId) return;

  const amount = invoice.amount_paid ?? invoice.amount_due ?? 0;
  const currency = invoice.currency || 'usd';

  const { error } = await getSupabaseAdmin()
    .from('payments')
    .upsert(
      {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        amount,
        currency,
        status: invoice.status === 'paid' ? 'succeeded' : invoice.status ?? 'pending',
      },
      { onConflict: 'stripe_invoice_id' }
    );

  if (error) {
    console.error('[webhook] Error recording payment:', error);
  } else {
    console.log(`[webhook] Recorded payment of ${amount} ${currency} for user ${userId}`);
  }
}

/**
 * Handle `checkout.session.completed`. Records the payment and, when a
 * subscription exists, retrieves + syncs it.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.invoice) {
    const invoiceId = typeof session.invoice === 'string' ? session.invoice : session.invoice.id;
    try {
      const invoice = await getStripe().invoices.retrieve(invoiceId);
      await recordPayment(invoice);
    } catch (error) {
      console.error('[webhook] Error retrieving invoice from checkout session:', error);
    }
  }

  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    try {
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
      await syncSubscription(subscription);
    } catch (error) {
      console.error('[webhook] Error retrieving subscription from checkout session:', error);
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  await syncSubscription(subscription);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  await syncSubscription(subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = await getUserIdFromCustomer(subscription.customer as string);
  if (!userId) {
    console.error('[webhook] Missing user_id for customer', subscription.customer);
    return;
  }

  const now = new Date().toISOString();
  const { error: subError } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'cancelled', cancel_at_period_end: false, updated_at: now })
    .eq('stripe_subscription_id', subscription.id);

  if (subError) {
    console.error('[webhook] Error updating subscription status:', subError);
  }

  const { error: profileError } = await getSupabaseAdmin()
    .from('profiles')
    .update({ plan: 'free', updated_at: now })
    .eq('id', userId);

  if (profileError) {
    console.error('[webhook] Error downgrading user plan:', profileError);
  }

  console.log(`[webhook] Downgraded user ${userId} to free (subscription deleted)`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const userId = await getUserIdFromCustomer(invoice.customer as string);
  if (!userId) return;

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('[webhook] Error marking subscription past_due:', error);
  }

  console.log(`[webhook] Payment failed for user ${userId}, invoice ${invoice.id}`);
}

export async function POST(request: Request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return new NextResponse('Stripe not configured', { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return new NextResponse('Missing stripe-signature', { status: 400 });
  }

  let webhookSecret = stripeConfig.webhookSecret;
  try {
    const { data } = await getSupabaseAdmin()
      .from('system_settings')
      .select('key, value')
      .eq('key', 'stripe_webhook_secret')
      .single();
    if (data?.value) {
      webhookSecret = data.value;
    }
  } catch (error) {
    console.error('[webhook] Error fetching webhook secret from system_settings:', error);
  }

  if (!webhookSecret) {
    console.error('[webhook] Webhook secret not configured (STRIPE_WEBHOOK_SECRET or system_settings)');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('[webhook] Signature verification failed:', error);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`);

  try {
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
      case 'invoice.paid':
        await recordPayment(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('[webhook] Handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
