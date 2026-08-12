/**
 * Shared API Route Auth Helpers (server-only)
 *
 * Consistent authentication/authorization for every API route:
 *  - getAuthUser: resolve the Supabase user from the `Authorization` header
 *  - requireAuth: return a 401 NextResponse or null when authenticated
 *  - requireAdmin: return a 401 NextResponse or null when the user is an admin
 *
 * All routes must authenticate through these helpers so behavior stays uniform.
 */

import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from './supabase-admin';

export type ApiUser = User;

/**
 * Resolve the authenticated user from the request's Bearer token.
 * Returns null when no/expired/invalid token is provided.
 */
export async function getAuthUser(request: Request): Promise<ApiUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Returns a 401 JSON response when the request is unauthenticated,
 * otherwise null. Callers: `const denied = await requireAuth(request); if (denied) return denied;`
 */
export async function requireAuth(
  request: Request
): Promise<NextResponse | null> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Check whether the authenticated user is an admin (profiles.is_admin = true).
 */
export async function isAdminUser(request: Request): Promise<boolean> {
  const user = await getAuthUser(request);
  if (!user) return false;

  try {
    const { data } = await getSupabaseAdmin()
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    return data?.is_admin === true;
  } catch {
    return false;
  }
}

/**
 * Returns a 401 JSON response when the request is unauthenticated OR the
 * user is not an admin, otherwise null.
 */
export async function requireAdmin(
  request: Request
): Promise<NextResponse | null> {
  if (!(await isAdminUser(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
