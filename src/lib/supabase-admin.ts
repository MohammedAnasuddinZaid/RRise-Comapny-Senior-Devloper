/**
 * Supabase Admin Client (server-only)
 *
 * Singleton client using the service role key to bypass RLS for trusted
 * server operations (webhooks, admin routes, cross-user reads/writes).
 *
 * SECURITY: NEVER import this from client-side code. The service role key
 * grants full database access and must never be exposed to the browser.
 */

import { createClient } from '@supabase/supabase-js';
import { isSupabaseAdminConfigured, supabaseConfig } from './env';

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Get the singleton Supabase admin client.
 * Throws if the service role key is not configured.
 *
 * NOTE: returns `any` because this fork of @supabase/supabase-js resolves
 * untyped schemas to `never` when the client is created through a wrapper.
 * Table/data typing is deliberately loose, matching the rest of the codebase.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): any {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Supabase admin client is not configured (missing service role key)');
  }
  if (!adminClient) {
    adminClient = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
