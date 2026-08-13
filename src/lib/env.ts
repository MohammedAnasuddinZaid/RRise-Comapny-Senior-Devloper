/**
 * Centralized Environment Configuration (server-only)
 *
 * Single source of truth for every environment variable the RRise backend uses.
 * Import this from API routes and server helpers instead of reading
 * `process.env` directly, so the whole backend behaves identically.
 *
 * SECURITY: Only reference this file from server-side code. Never import it
 * into a client component. NEXT_PUBLIC_* values are safe to expose; everything
 * else must stay server-only.
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '',
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  pricePro: process.env.STRIPE_PRICE_PRO || '',
  priceUltra: process.env.STRIPE_PRICE_ULTRA || '',
};

export const appConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

/** Server-only secret used to encrypt BYOK API keys at rest. */
export const byokEncKey = process.env.BYOK_ENC_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.serviceRoleKey);
}

export function isStripeConfigured(): boolean {
  return Boolean(stripeConfig.secretKey);
}

/**
 * Resolve the Stripe price ID for a plan.
 * Env-provided price IDs are the source of truth (STRIPE_PRICE_PRO / ULTRA).
 * If `overrides` is provided (e.g. fetched from system_settings), it wins.
 */
export function getStripePriceId(
  plan: 'pro' | 'ultra',
  overrides?: Record<string, string>
): string {
  if (overrides) {
    const key = plan === 'pro' ? 'stripe_pro_price_id' : 'stripe_ultra_price_id';
    if (overrides[key]) return overrides[key];
  }
  return plan === 'pro' ? stripeConfig.pricePro : stripeConfig.priceUltra;
}
