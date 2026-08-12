/**
 * Stripe Billing Portal API Route
 *
 * Creates a Stripe Customer Portal session so users can manage their
 * subscription (upgrade/downgrade/cancel/payment methods) themselves.
 */

import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { appConfig } from '@/lib/env';

export async function POST() {
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
    return NextResponse.json(
      { error: 'User not authenticated. Please log in and try again.' },
      { status: 401 }
    );
  }

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing customer found for this account' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appConfig.url}/app/settings`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Billing portal session created without a redirect URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[billing-portal] Error creating portal session:', error);
    return NextResponse.json(
      {
        error: `Failed to open billing portal: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
