/**
 * Server-side Supabase Client
 *
 * This file is for server-side usage only (server components, server actions, API routes).
 * It uses cookies for session management.
 *
 * DO NOT import this file in client components.
 *
 * Environment variables needed:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseConfig } from './env';

/**
 * Server-side Supabase client
 * Use this in server components and server actions
 * Uses cookies for session management
 * Note: This is an async function because cookies() returns a Promise in Next.js 16
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
