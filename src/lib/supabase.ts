/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for client-side usage.
 * For server-side usage, use the separate server-only client.
 * 
 * Environment variables needed:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Client-side Supabase client
 * Use this in client components ('use client')
 */
export const createClientComponentClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Returning null client.');
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Simple Supabase client for non-Next.js contexts
 * Use this in utility functions or API routes
 */
export const supabase = !supabaseUrl || !supabaseAnonKey ? null : createClient(supabaseUrl, supabaseAnonKey);
