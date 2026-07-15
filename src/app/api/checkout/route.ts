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
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Stripe with secret key (with fallback check in the handler)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Get Stripe price ID for a plan from system_settings
 * Falls back to environment variables or default values
 */
async function getPriceIdForPlan(plan: 'pro' | 'ultra', supabase: any): Promise<string> {
  try {
    // Try to fetch from system_settings table first
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['stripe_pro_price', 'stripe_ultra_price']);
    
    if (settings && settings.length > 0) {
      const priceMap: Record<string, string> = {};
      settings.forEach((setting: any) => {
        priceMap[setting.key] = setting.value;
      });
      
      const priceId = priceMap[plan === 'pro' ? 'stripe_pro_price' : 'stripe_ultra_price'];
      if (priceId) {
        console.log(`Using price ID from system_settings for ${plan}:`, priceId);
        return priceId;
      }
    }
  } catch (error) {
    console.error('Error fetching price from system_settings:', error);
  }
  
  // Fallback to environment variables
  const priceIds: Record<string, string> = {
    pro: process.env.STRIPE_PRICE_PRO || 'price_1ToJGuIaxTgHtJYBAFVh6s4M',
    ultra: process.env.STRIPE_PRICE_ULTRA || 'price_1ToJJVIaxTgHtJYBa2rkDBDo',
  };
  
  const priceId = priceIds[plan];
  console.log(`Using fallback price ID for ${plan}:`, priceId);
  
  return priceId;
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

    // Get user from Supabase auth using server-side client with cookie header
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Cookie: cookieStore.toString()
          }
        }
      }
    );

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'User not authenticated. Please log in and try again.' },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to fetch user profile' },
          { status: 500 }
        );
      }

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
    } catch (error) {
      console.error('Error managing Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to manage customer information' },
        { status: 500 }
      );
    }

    // Get price ID for the plan from system_settings
    const priceId = await getPriceIdForPlan(plan, supabase);
    console.log('Creating checkout session with price ID:', priceId);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

    // Create checkout session
    let session;
    try {
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?cancelled=true`;
      
      console.log('Success URL:', successUrl);
      console.log('Cancel URL:', cancelUrl);
      
      session = await stripe.checkout.sessions.create({
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
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      
      console.log('Checkout session created successfully:', session.id);
    } catch (error) {
      console.error('Stripe checkout session creation error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return NextResponse.json(
        { error: `Failed to create Stripe checkout session: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
