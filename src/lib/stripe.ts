/**
 * Stripe Client (server-only)
 *
 * Singleton Stripe instance shared across the backend.
 * NEVER import this from client-side code.
 */

import Stripe from 'stripe';
import { isStripeConfigured, stripeConfig } from './env';

let _stripe: Stripe | null = null;

/**
 * Get the singleton Stripe client.
 * Throws if the secret key is not configured.
 */
export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY)');
  }
  if (!_stripe) {
    _stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2026-05-27.dahlia',
    });
  }
  return _stripe;
}
