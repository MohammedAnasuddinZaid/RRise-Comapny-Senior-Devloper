/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for client-side usage.
 * For server-side usage, use the separate server-only client.
 * 
 * Environment variables needed:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * 
 * Note: This file also supports NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as an alternative
 * to NEXT_PUBLIC_SUPABASE_ANON_KEY for compatibility with different Supabase setups.
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Check if Supabase is properly configured
 * This is the central helper for all Supabase configuration checks
 * 
 * @returns true if Supabase is configured, false otherwise
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Get Supabase public configuration
 * Returns the URL and anon key if configured
 * 
 * @returns Object with url and anonKey, or null if not configured
 */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

// Debug logging (remove in production)
if (typeof window === 'undefined') {
  console.log('Server-side Supabase config check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl.substring(0, 20) + '...',
  });
}

/**
 * Module-level singleton for the browser Supabase client.
 * 
 * IMPORTANT: We cache this here to avoid the "Multiple GoTrueClient instances" warning.
 * Every new createBrowserClient() call spawns a new auth session, which causes
 * race conditions and undefined behaviour. One client per browser context is correct.
 */
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClientComponentClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Returning null client.');
    console.log('Environment check:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
    });
    return null;
  }
  // Return the cached client if it already exists (prevents multiple GoTrueClient instances)
  if (!_browserClient) {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
};

/**
 * Simple Supabase client for non-Next.js contexts
 * Use this in utility functions or API routes
 */
export const supabase = !supabaseUrl || !supabaseAnonKey ? null : createClient(supabaseUrl, supabaseAnonKey);
