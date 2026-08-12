/**
 * Subscription API Route
 *
 * GET  → current subscription + plan for the authenticated user
 * POST → cancel the active subscription (cancel at end of billing period)
 */

import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  const { data: profile } = await admin
    .from('profiles')
    .select('plan, stripe_customer_id')
    .eq('id', user.id)
    .single();

  const { data: subscriptions } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  return NextResponse.json({
    plan: profile?.plan || 'free',
    subscription: subscriptions?.[0] || null,
  });
}

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subscription } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!subscription?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  try {
    const updated = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updated.id,
        status: updated.status,
        cancel_at_period_end: updated.cancel_at_period_end,
        current_period_end: updated.items.data[0]?.current_period_end
          ? new Date(updated.items.data[0].current_period_end * 1000).toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error('[subscription] Error cancelling subscription:', error);
    return NextResponse.json(
      {
        error: `Failed to cancel subscription: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
