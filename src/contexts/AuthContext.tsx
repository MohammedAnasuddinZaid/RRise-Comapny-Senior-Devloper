"use client";

/**
 * AuthContext - Authentication and Session Management
 * 
 * This context provides authentication state and methods for the entire RRise application.
 * It handles:
 * - User session management
 * - Sign in with Google and email
 * - Sign out
 * - Profile data fetching
 * - Loading states
 * 
 * Usage:
 * Wrap your app with <AuthProvider> in the root layout
 * Use const { user, session, signIn, signOut } = useAuth() in components
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';
import { initializeUser } from '@/lib/userInitialization';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, name: string, termsAccepted?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use the AuthContext
 * Throws an error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClientComponentClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with Google OAuth
   * Redirects to Google sign-in page
   */
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    return { error };
  };

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      // Redirect to dashboard after successful login
      window.location.href = '/app/dashboard';
    }
    
    return { error };
  };

  /**
   * Sign up with email, password, and name
   * The name is stored in user metadata and will be used to create the profile
   */
  const signUpWithEmail = async (email: string, password: string, name: string, termsAccepted?: boolean) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.' } as AuthError };
    }
    
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { error: { message: 'Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.' } as AuthError };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          terms_accepted: termsAccepted,
        },
        emailRedirectTo: `${window.location.origin}/app/dashboard`,
      },
    });

    if (!error && data.user) {
      // Initialize user data after successful signup
      await initializeUser(data.user.id, email, name, termsAccepted);
      
      // Redirect to dashboard after successful signup
      window.location.href = '/app/dashboard';
    }

    return { error };
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
