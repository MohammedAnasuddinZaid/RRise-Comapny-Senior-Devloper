/**
 * Stripe Checkout API Route
 *
 * Creates a Stripe Checkout session for subscription purchases.
 *
 * Security notes:
 * - The requesting user is identified from their Supabase session cookies.
 * - The user's Stripe customer is reused when one already exists.
 * - Price IDs come from env (STRIPE_PRICE_PRO / STRIPE_PRICE_ULTRA), with
 *   optional overrides from system_settings.
 *
 * Flow:
 * 1. User selects a plan on the pricing page
 * 2. Frontend calls this API with the plan type
 * 3. This API creates a Stripe Checkout session
 * 4. User is redirected to Stripe Checkout
 * 5. After payment, Stripe sends a webhook to sync the plan in Supabase
 */

import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { appConfig, getStripePriceId } from '@/lib/env';

const PLANS = ['pro', 'ultra'] as const;
type Plan = (typeof PLANS)[number];

function isPlan(value: unknown): value is Plan {
  return typeof value === 'string' && (PLANS as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { plan } = (body ?? {}) as { plan?: unknown };

  if (!isPlan(plan)) {
    return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: 'Payment system is currently unavailable (missing configuration)' },
      { status: 503 }
    );
  }

  const supabase = await createServerComponentClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('[checkout] Auth error:', authError);
    return NextResponse.json(
      { error: 'User not authenticated. Please log in and try again.' },
      { status: 401 }
    );
  }

  // Resolve the Stripe customer (reuse existing, else create + persist).
  let customerId: string;
  try {
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      const { error: updateError } = await getSupabaseAdmin()
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
      if (updateError) {
        console.error('[checkout] Error saving customer ID to profile:', updateError);
      }
    }
  } catch (error) {
    console.error('[checkout] Error managing Stripe customer:', error);
    return NextResponse.json(
      { error: 'Failed to manage customer information' },
      { status: 500 }
    );
  }

  // Resolve price ID from system_settings overrides or env.
  let priceOverrides: Record<string, string> | undefined;
  try {
    const { data: settings } = await getSupabaseAdmin()
      .from('system_settings')
      .select('key, value')
      .in('key', ['stripe_pro_price_id', 'stripe_ultra_price_id']);
    if (settings && settings.length > 0) {
      const overrides: Record<string, string> = {};
      settings.forEach((s: { key: string; value: string | null }) => {
        if (s.value != null) {
          overrides[s.key] = s.value;
        }
      });
      priceOverrides = overrides;
    }
  } catch (error) {
    console.error('[checkout] Error fetching price overrides:', error);
  }

  const priceId = getStripePriceId(plan, priceOverrides);
  if (!priceId) {
    console.error('[checkout] No price ID configured for plan:', plan);
    return NextResponse.json(
      { error: `Price not configured for ${plan} plan` },
      { status: 500 }
    );
  }

  try {
    const successUrl = `${appConfig.url}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appConfig.url}/pricing?cancelled=true`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        plan,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Checkout session created without a redirect URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[checkout] Stripe checkout session creation error:', error);
    return NextResponse.json(
      {
        error: `Failed to create Stripe checkout session: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
