/**
 * Data Loading Utilities
 * 
 * This file provides functions to load user data from Supabase.
 * It replaces the mock data with real database data.
 * 
 * Functions:
 * - loadUserProfile: Load user profile data
 * - loadHabits: Load user's habits
 * - loadTasks: Load user's tasks
 * - loadMascotState: Load mascot evolution state
 * - loadStreakData: Load streak information
 */

import { createClientComponentClient } from '@/lib/supabase';
import { Profile, Habit, Task, MascotState } from '@/types/database';

/**
 * Load user profile data from Supabase
 * 
 * @param userId - The user's ID
 * @returns User profile or null if not found
 */
export async function loadUserProfile(userId: string): Promise<Profile | null> {
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Load user's habits from Supabase
 * Includes completion status and streak calculation
 * 
 * @param userId - The user's ID
 * @returns Array of habits with completion status
 */
export async function loadHabits(userId: string): Promise<any[]> {
  const supabase = createClientComponentClient();
  if (!supabase) return [];

  try {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading habits:', error);
      return [];
    }

    if (!habits || habits.length === 0) return [];

    // For each habit, get today's completion status
    const today = new Date().toISOString().split('T')[0];
    const habitsWithStatus = await Promise.all(
      habits.map(async (habit) => {
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', habit.id)
          .gte('completed_at', today)
          .order('completed_at', { ascending: false });

        const completedToday = logs && logs.length > 0;
        
        // Calculate streak from logs (simplified)
        const { count: streakCount } = await supabase
          .from('habit_logs')
          .select('*', { count: 'exact', head: false })
          .eq('habit_id', habit.id);

        return {
          ...habit,
          completed: completedToday || false,
          streak: streakCount || 0,
          icon: 'brain', // Default icon, can be enhanced later
        };
      })
    );

    return habitsWithStatus;
  } catch (error) {
    console.error('Error loading habits:', error);
    return [];
  }
}

/**
 * Load user's tasks from Supabase
 * Includes completion status
 * 
 * @param userId - The user's ID
 * @returns Array of tasks with completion status
 */
export async function loadTasks(userId: string): Promise<any[]> {
  const supabase = createClientComponentClient();
  if (!supabase) return [];

  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      return [];
    }

    if (!tasks || tasks.length === 0) return [];

    // For each task, get today's completion status
    const today = new Date().toISOString().split('T')[0];
    const tasksWithStatus = await Promise.all(
      tasks.map(async (task) => {
        const { data: logs } = await supabase
          .from('task_logs')
          .select('*')
          .eq('task_id', task.id)
          .gte('completed_at', today)
          .order('completed_at', { ascending: false });

        const completedToday = logs && logs.length > 0;

        return {
          ...task,
          completed: completedToday || false,
          dueTime: task.due_date || new Date().toISOString(),
        };
      })
    );

    return tasksWithStatus;
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

/**
 * Load mascot state from Supabase
 * 
 * @param userId - The user's ID
 * @returns Mascot state or null if not found
 */
export async function loadMascotState(userId: string): Promise<MascotState | null> {
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('mascot_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error loading mascot state:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading mascot state:', error);
    return null;
  }
}

/**
 * Load streak data from Supabase
 * 
 * @param userId - The user's ID
 * @returns Streak count
 */
export async function loadStreakCount(userId: string): Promise<number> {
  const supabase = createClientComponentClient();
  if (!supabase) return 0;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('streak')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading streak count:', error);
      return 0;
    }

    return data?.streak || 0;
  } catch (error) {
    console.error('Error loading streak count:', error);
    return 0;
  }
}

/**
 * Toggle habit completion status
 * 
 * @param habitId - The habit ID
 * @param userId - The user's ID (for security)
 * @param completed - New completion status
 * @returns Success status
 */
export async function toggleHabitCompletion(
  habitId: string,
  userId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error } = await supabase
      .from('habits')
      .update({ completed })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log habit completion
    if (completed) {
      await supabase.from('habit_logs').insert({
        habit_id: habitId,
        user_id: userId,
        completed_at: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to toggle habit' 
    };
  }
}

/**
 * Toggle task completion status
 * 
 * @param taskId - The task ID
 * @param userId - The user's ID (for security)
 * @param completed - New completion status
 * @returns Success status
 */
export async function toggleTaskCompletion(
  taskId: string,
  userId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log task completion
    if (completed) {
      await supabase.from('task_logs').insert({
        task_id: taskId,
        user_id: userId,
        completed_at: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to toggle task' 
    };
  }
}
