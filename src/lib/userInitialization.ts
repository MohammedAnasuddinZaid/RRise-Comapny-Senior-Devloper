/**
 * User Initialization Utilities
 * 
 * This file handles first-time user initialization when they sign up.
 * It creates default data for new users including:
 * - Profile with default plan (free)
 * - Default mascot state
 * - Default app settings
 * - Default memory entry
 * 
 * This is called automatically when a new user signs up via the AuthContext.
 */

import { createClientComponentClient } from '@/lib/supabase';
import { PlanType } from '@/types/database';

/**
 * Initialize a new user with default data
 * This should be called when a user first signs up
 * 
 * @param userId - The user's ID from Supabase auth
 * @param email - The user's email
 * @param name - The user's name (from signup or metadata)
 * @returns Success status and error if any
 */
export async function initializeUser(
  userId: string,
  email: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Profile already exists, no need to initialize
      return { success: true };
    }

    // Create profile with default values
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: name || email.split('@')[0],
      plan: 'free' as PlanType,
      xp: 0,
      streak: 0,
      mascot_level: 1,
      onboarding_completed: false,
    });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return { success: false, error: profileError.message };
    }

    // Create default mascot state
    const { error: mascotError } = await supabase.from('mascot_state').insert({
      user_id: userId,
      current_stage: 'Baby Parrot',
      xp: 0,
      level: 1,
      evolution_progress: 0,
      last_interaction_at: new Date().toISOString(),
    });

    if (mascotError) {
      console.error('Error creating mascot state:', mascotError);
      // Continue even if mascot creation fails
    }

    // Create default app settings
    const { error: settingsError } = await supabase.from('app_settings').insert({
      user_id: userId,
      theme: 'dark',
      notifications_enabled: true,
      reminder_enabled: true,
      reminder_time: '09:00',
    });

    if (settingsError) {
      console.error('Error creating app settings:', settingsError);
      // Continue even if settings creation fails
    }

    // Create default memory entry
    const { error: memoryError } = await supabase.from('prompt_memory').insert({
      user_id: userId,
      memory_type: 'preferences',
      memory_value: JSON.stringify({
        age_range: null,
        study_level: null,
        fitness_level: null,
        goals: [],
        interests: [],
      }),
      importance: 'medium',
    });

    if (memoryError) {
      console.error('Error creating memory entry:', memoryError);
      // Continue even if memory creation fails
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize user' 
    };
  }
}

/**
 * Check if a user has completed onboarding
 * 
 * @param userId - The user's ID
 * @returns Whether onboarding is completed
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient();
  if (!supabase) {
    return false;
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    return data?.onboarding_completed || false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed for a user
 * 
 * @param userId - The user's ID
 * @returns Success status and error if any
 */
export async function completeOnboarding(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
    };
  }
}
