/**
 * Stripe Checkout API Route
 * 
 * This API route creates a Stripe checkout session for subscription purchases.
 * 
 * IMPORTANT SECURITY NOTES:
 * - This endpoint uses the service role key to bypass RLS for plan updates
 * - User authentication is required
 * - Price IDs are validated against allowed plans
 * - Customer metadata includes user_id for webhook correlation
 * 
 * Flow:
 * 1. User selects a plan on pricing page
 * 2. Frontend calls this API with plan type
 * 3. This API creates a Stripe checkout session
 * 4. User is redirected to Stripe checkout
 * 5. After payment, Stripe sends webhook to update Supabase plan
 * 6. User is redirected back to app
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClientComponentClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with secret key (with fallback check in the handler)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Get Stripe price ID for a plan
 * In production, these should be configured in Stripe Dashboard
 */
function getPriceIdForPlan(plan: 'pro' | 'ultra'): string {
  // Use exact price IDs provided
  const priceIds: Record<string, string> = {
    pro: process.env.STRIPE_PRICE_PRO || 'price_1ToJGuIaxTgHtJYBAFVh6s4M',
    ultra: process.env.STRIPE_PRICE_ULTRA || 'price_1ToJJVIaxTgHtJYBa2rkDBDo',
  };
  return priceIds[plan];
}

/**
 * Create a Stripe checkout session
 */
export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (!plan || (plan !== 'pro' && plan !== 'ultra')) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system is currently unavailable (missing configuration)' },
        { status: 503 }
      );
    }

    // Get user from Supabase auth
    const supabase = createClientComponentClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error saving customer ID to profile:', updateError);
      }
    }

    // Get price ID for the plan
    const priceId = getPriceIdForPlan(plan);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
