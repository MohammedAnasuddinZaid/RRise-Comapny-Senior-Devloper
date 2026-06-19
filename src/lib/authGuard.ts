/**
 * Auth Guard Utilities
 * 
 * This file provides utilities for protecting routes and checking authentication status.
 * 
 * Usage:
 * - useRequireAuth() hook for client components
 * - requireAuthServer() for server components
 * - redirectIfAuthenticated() for public-only pages (like login)
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to check if user is authenticated
 * Redirects to landing page if user is not authenticated
 * 
 * @returns Object with user, loading state, and authentication status
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    // Also check if Supabase is configured - if not, allow demo mode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!loading && !user && supabaseUrl && supabaseKey) {
      // Only redirect if Supabase is configured and user is not authenticated
      // Prevent redirect loop by checking current path
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Server-side auth check
 * Use this in server components to check authentication
 * 
 * @param userId - The user ID to check
 * @returns Whether the user is authenticated
 */
export async function requireAuthServer(userId: string): Promise<boolean> {
  // This would typically check the session in a server component
  // For now, return true if userId is provided
  // TODO: Implement proper server-side session checking
  return !!userId;
}

/**
 * Redirect if user is already authenticated
 * Use this for pages like login/signup that should only be accessible to unauthenticated users
 * 
 * @returns Object with user and loading state
 */
export function redirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/app/dashboard');
    }
  }, [user, loading, router]);

  return { user, loading };
}
