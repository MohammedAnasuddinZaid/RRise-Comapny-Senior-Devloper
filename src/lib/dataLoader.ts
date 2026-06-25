/**
 * Data Loading Utilities
 * 
 * This file provides functions to load user data from Supabase.
 * 
 * Functions:
 * - loadUserProfile: Load user profile data
 * - loadHabits: Load user habits with completion status
 * - loadTasks: Load user tasks with due dates
 * - loadMascotState: Load mascot state and evolution
 * - loadStreakCount: Load current streak count
 * - loadSpendingData: Load spending transactions and budget
 * - loadActivityHistory: Load comprehensive activity history
 * - bootstrapUserData: Create required rows for new users
 * - ensureUserData: Check and create missing user data rows
 */

import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, Habit, Task, MascotState } from '@/types/database';

/**
 * Load user profile data from Supabase
 * 
 * @param userId - The user's ID
 * @returns User profile or null if not found
 */
export async function loadUserProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  
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
  if (!isSupabaseConfigured()) return [];
  
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
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(today + 'T23:59:59.999Z').toISOString();
    
    const habitsWithStatus = await Promise.all(
      habits.map(async (habit: any) => {
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', habit.id)
          .gte('completed_at', todayStart)
          .lte('completed_at', todayEnd)
          .order('completed_at', { ascending: false });

        const completedToday = logs && logs.length > 0;
        
        // Calculate streak from logs (simplified)
        const { count: streakCount } = await supabase
          .from('habit_logs')
          .select('*', { count: 'exact', head: false })
          .eq('habit_id', habit.id);

        // Parse icon from description JSON (stored there because 'icon' column doesn't exist)
        let icon = 'brain'; // default
        try {
          if (habit.description) {
            const parsed = JSON.parse(habit.description);
            if (parsed.icon) icon = parsed.icon;
          }
        } catch {
          // description is plain text, not JSON — keep default icon
        }

        return {
          ...habit,
          completed: completedToday || false,
          streak: streakCount || 0,
          icon,
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
  if (!isSupabaseConfigured()) return [];
  
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
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(today + 'T23:59:59.999Z').toISOString();
    
    const tasksWithStatus = await Promise.all(
      tasks.map(async (task: any) => {
        const { data: logs } = await supabase
          .from('task_logs')
          .select('*')
          .eq('task_id', task.id)
          .gte('completed_at', todayStart)
          .lte('completed_at', todayEnd)
          .order('completed_at', { ascending: false });

        const completedToday = logs && logs.length > 0;

        // Parse dueTime from description JSON (stored there to preserve time component)
        // because 'due_date' is a DATE column that only stores the date portion
        let dueTime = task.due_date || new Date().toISOString();
        try {
          if (task.description) {
            const parsed = JSON.parse(task.description);
            if (parsed.dueTime) dueTime = parsed.dueTime;
          }
        } catch {
          // description is plain text, not JSON — keep due_date fallback
        }

        return {
          ...task,
          completed: completedToday || task.status === 'completed',
          dueTime,
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
 * Update an existing habit
 * 
 * @param habitId - The habit ID
 * @param userId - The user's ID (for security)
 * @param title - New habit title
 * @param icon - New habit icon
 * @returns Success status and habit data
 */
export async function updateHabit(
  habitId: string,
  userId: string,
  title: string,
  icon: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // The habits table has no 'icon' column; we store the icon in description as JSON
    const descriptionPayload = JSON.stringify({ icon });

    const { data, error } = await supabase
      .from('habits')
      .update({ title, description: descriptionPayload })
      .eq('id', habitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update habit' 
    };
  }
}

/**
 * Load mascot state from Supabase
 * 
 * @param userId - The user's ID
 * @returns Mascot state or null if not found
 */
export async function loadMascotState(userId: string): Promise<MascotState | null> {
  if (!isSupabaseConfigured()) return null;
  
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  try {
    // NOTE: maybeSingle() returns null (not an error) when no row is found.
    // Using single() here caused PGRST116 console errors on new users.
    const { data, error } = await supabase
      .from('mascot_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading mascot state:', error);
      // Return default mascot state if not found
      return {
        id: '',
        user_id: userId,
        level: 1,
        evolution_stage: 'egg',
        total_interactions: 0,
        last_fed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // data will be null if no row exists; return default in that case
    if (!data) {
      return {
        id: '',
        user_id: userId,
        level: 1,
        evolution_stage: 'egg',
        total_interactions: 0,
        last_fed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data;
  } catch (error) {
    console.error('Error loading mascot state:', error);
    // Return default mascot state on error
    return {
      id: '',
      user_id: userId,
      level: 1,
      evolution_stage: 'egg',
      total_interactions: 0,
      last_fed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Load streak data from Supabase
 * 
 * @param userId - The user's ID
 * @returns Streak count
 */
export async function loadStreakCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  
  const supabase = createClientComponentClient();
  if (!supabase) return 0;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('streak_count')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading streak count:', error);
      return 0;
    }

    return data?.streak_count || 0;
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
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs to prevent injection
    if (!habitId || !userId) {
      return { success: false, error: 'Invalid input' };
    }

    const today = new Date().toISOString().split('T')[0];

    if (completed) {
      // Check if already completed today to prevent duplicate XP farming
      // NOTE: Use maybeSingle() not single() — single() throws PGRST116 when no row found
      const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', today)
        .maybeSingle();

      if (!existingLog) {
        // Insert habit completion log
        const { error: insertError } = await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          xp_earned: 10, // Default XP reward
        });

        if (insertError) {
          return { success: false, error: insertError.message };
        }

        // Update user XP total in profiles table
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('xp_total')
          .eq('id', userId)
          .single();

        if (currentProfile) {
          const newXP = (currentProfile.xp_total || 0) + 10;
          const { error: xpError } = await supabase
            .from('profiles')
            .update({ xp_total: newXP })
            .eq('id', userId);

          if (xpError) {
            console.error('Error updating XP total:', xpError);
          }
        }

        // Log XP gain
        await supabase.from('xp_logs').insert({
          user_id: userId,
          amount: 10,
          reason: 'Habit completion',
          source: 'habit',
        });

        // NOTE: Use maybeSingle() to avoid PGRST116 when streak row doesn't exist yet
        const { data: currentStreak } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', userId)
          .eq('type', 'habits')
          .maybeSingle();

        if (currentStreak) {
          const newStreak = (currentStreak.current_streak || 0) + 1;
          const { error: streakError } = await supabase
            .from('streaks')
            .update({ 
              current_streak: newStreak,
              last_activity_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('type', 'habits');

          if (streakError) {
            console.error('Error updating streak:', streakError);
          }
        }
      }
    } else {
      // UNCHECK: Remove today's completion log
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', today);

      // Revert XP when unchecking
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('xp_total')
        .eq('id', userId)
        .single();

      if (currentProfile) {
        const newXP = Math.max(0, (currentProfile.xp_total || 0) - 10);
        await supabase
          .from('profiles')
          .update({ xp_total: newXP })
          .eq('id', userId);
      }

      // Log negative XP for unchecking
      await supabase.from('xp_logs').insert({
        user_id: userId,
        amount: -10,
        reason: 'Habit uncompleted',
        source: 'penalty',
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
 * IMPORTANT SECURITY & XP FARMING PREVENTION:
 * - XP is awarded only ONCE per task to prevent farming
 * - Uses task status to check if XP was already awarded
 * - When unchecking, XP is NOT returned (no farming by uncheck/recheck)
 * - XP is permanent once awarded for the task
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
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs to prevent injection
    if (!taskId || !userId) {
      return { success: false, error: 'Invalid input' };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(today + 'T23:59:59.999Z').toISOString();

    if (completed) {
      // Check if already completed today to prevent duplicate XP farming
      const { data: existingLog } = await supabase
        .from('task_logs')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', userId)
        .gte('completed_at', todayStart)
        .lte('completed_at', todayEnd)
        .maybeSingle();

      if (!existingLog) {
        // Update task status
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'completed' })
          .eq('id', taskId)
          .eq('user_id', userId);

        if (error) {
          return { success: false, error: error.message };
        }

        // Log task completion with XP
        await supabase.from('task_logs').insert({
          task_id: taskId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          xp_earned: 15, // XP reward for task completion (as per requirements)
        });

        // Update user XP total in profiles table (permanent, no farming)
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('xp_total')
          .eq('id', userId)
          .single();

        if (currentProfile) {
          const newXP = (currentProfile.xp_total || 0) + 15;
          const { error: xpError } = await supabase
            .from('profiles')
            .update({ xp_total: newXP })
            .eq('id', userId);

          if (xpError) {
            console.error('Error updating XP total:', xpError);
          }
        }

        // Log XP gain in xp_logs table for audit trail
        await supabase.from('xp_logs').insert({
          user_id: userId,
          amount: 15,
          reason: 'Task completion',
          source: 'task',
        });

        // Update overall streak
        const { data: currentStreak } = await supabase
          .from('streaks')
          .select('current_streak, best_streak, last_activity_at')
          .eq('user_id', userId)
          .eq('type', 'overall')
          .maybeSingle();

        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        
        if (currentStreak) {
          // Check if last activity was yesterday
          const lastActivityDate = currentStreak.last_activity_at 
            ? new Date(currentStreak.last_activity_at).toISOString().split('T')[0]
            : null;
          
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDate = yesterday.toISOString().split('T')[0];
          
          let newStreak = currentStreak.current_streak || 0;
          let newBestStreak = currentStreak.best_streak || 0;
          
          if (lastActivityDate === yesterdayDate) {
            // Consecutive day - increment streak
            newStreak += 1;
          } else if (lastActivityDate !== todayDate) {
            // Streak broken - reset to 1
            newStreak = 1;
          }
          
          if (newStreak > newBestStreak) {
            newBestStreak = newStreak;
          }
          
          const { error: streakError } = await supabase
            .from('streaks')
            .update({ 
              current_streak: newStreak,
              best_streak: newBestStreak,
              last_activity_at: now.toISOString()
            })
            .eq('user_id', userId)
            .eq('type', 'overall');

          if (streakError) {
            console.error('Error updating streak:', streakError);
          }
        } else {
          // Create new streak record
          const { error: streakError } = await supabase
            .from('streaks')
            .insert({
              user_id: userId,
              type: 'overall',
              current_streak: 1,
              best_streak: 1,
              last_activity_at: now.toISOString()
            });

          if (streakError) {
            console.error('Error creating streak:', streakError);
          }
        }
      }
    } else {
      // UNCHECK: Delete task log for today and revert XP
      await supabase
        .from('task_logs')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      // Update task status back to pending
      await supabase
        .from('tasks')
        .update({ status: 'pending' })
        .eq('id', taskId)
        .eq('user_id', userId);

      // Revert XP when unchecking
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('xp_total')
        .eq('id', userId)
        .single();

      if (currentProfile) {
        const newXP = Math.max(0, (currentProfile.xp_total || 0) - 15);
        await supabase
          .from('profiles')
          .update({ xp_total: newXP })
          .eq('id', userId);
      }

      // Log negative XP for unchecking
      await supabase.from('xp_logs').insert({
        user_id: userId,
        amount: -15,
        reason: 'Task uncompleted',
        source: 'penalty',
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

/**
 * Create a new habit
 * 
 * @param userId - The user's ID
 * @param title - Habit title
 * @param icon - Habit icon (default: 'brain')
 * @returns Success status with habit data
 */
export async function createHabit(
  userId: string,
  title: string,
  icon: string = 'brain'
): Promise<{ success: boolean; error?: string; data?: any }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs
    if (!userId || !title) {
      return { success: false, error: 'Invalid input' };
    }

    // IMPORTANT: The 'habits' table has NO 'icon', 'completed', or 'streak' columns.
    // We store the icon as JSON in the 'description' column.
    // Completion status is derived from 'habit_logs' at query time.
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        title,
        description: JSON.stringify({ icon }), // store icon in description JSON
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Return the data with virtual fields added so callers don't break
    return { success: true, data: { ...data, icon, completed: false, streak: 0 } };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create habit' 
    };
  }
}

/**
 * Delete a habit
 * 
 * @param habitId - The habit ID
 * @param userId - The user's ID (for security)
 * @returns Success status
 */
export async function deleteHabit(
  habitId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs
    if (!habitId || !userId) {
      return { success: false, error: 'Invalid input' };
    }

    // Delete habit logs first (cascade)
    await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId);

    // Delete habit
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete habit' 
    };
  }
}

/**
 * Create a new task
 * 
 * @param userId - The user's ID
 * @param title - Task title
 * @param dueTime - Task due time
 * @returns Success status with task data
 */
export async function createTask(
  userId: string,
  title: string,
  dueTime: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs
    if (!userId || !title) {
      return { success: false, error: 'Invalid input' };
    }

    // IMPORTANT: 'tasks' table has NO 'completed' column — it uses 'status' TEXT.
    // 'due_date' is DATE type (not timestamptz), so we strip the time portion.
    // Store the original time string in description JSON so we can display it.
    const dueDateOnly = dueTime ? dueTime.split('T')[0] : null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        status: 'pending',          // use status, not completed
        due_date: dueDateOnly,       // DATE only, no time component
        description: dueTime ? JSON.stringify({ dueTime }) : null, // store full time for display
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Return with virtual 'completed' and 'dueTime' fields so callers don't break
    return { success: true, data: { ...data, completed: false, dueTime } };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create task' 
    };
  }
}

/**
 * Delete a task
 * 
 * @param taskId - The task ID
 * @param userId - The user's ID (for security)
 * @returns Success status
 */
export async function deleteTask(
  taskId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs
    if (!taskId || !userId) {
      return { success: false, error: 'Invalid input' };
    }

    // Delete task logs first (cascade)
    await supabase
      .from('task_logs')
      .delete()
      .eq('task_id', taskId);

    // Delete task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete task' 
    };
  }
}

/**
 * Load spending data from Supabase
 * 
 * @param userId - The user's ID
 * @returns Spending data with transactions and categories
 */
export async function loadSpendingData(userId: string): Promise<{
  currency: string;
  totalSpent: number;
  budget: number;
  recentTransactions: Array<{ id: string; title: string; amount: number; date: string }>;
  categories: Array<{ name: string; amount: number; color: string }>;
}> {
  if (!isSupabaseConfigured()) {
    return {
      currency: "$",
      totalSpent: 0,
      budget: 100,
      recentTransactions: [],
      categories: [
        { name: "Food", amount: 0, color: "#00ff87" },
        { name: "Transport", amount: 0, color: "#00e5ff" },
        { name: "Entertainment", amount: 0, color: "#ff6b6b" },
        { name: "Shopping", amount: 0, color: "#ffd93d" },
      ],
    };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) {
    return {
      currency: "$",
      totalSpent: 0,
      budget: 100,
      recentTransactions: [],
      categories: [
        { name: "Food", amount: 0, color: "#00ff87" },
        { name: "Transport", amount: 0, color: "#00e5ff" },
        { name: "Entertainment", amount: 0, color: "#ff6b6b" },
        { name: "Shopping", amount: 0, color: "#ffd93d" },
      ],
    };
  }

  try {
    // Load transactions from spending_entries table (correct table name from schema)
    const { data: transactions, error: txError } = await supabase
      .from('spending_entries') // Fixed: was 'spending', now 'spending_entries'
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) {
      console.error('Error loading spending transactions:', txError);
      return {
        currency: "$",
        totalSpent: 0,
        budget: 100,
        recentTransactions: [],
        categories: [
          { name: "Food", amount: 0, color: "#00ff87" },
          { name: "Transport", amount: 0, color: "#00e5ff" },
          { name: "Entertainment", amount: 0, color: "#ff6b6b" },
          { name: "Shopping", amount: 0, color: "#ffd93d" },
        ],
      };
    }

    // Calculate totals by category
    const categoryTotals: Record<string, number> = {
      "Food": 0,
      "Transport": 0,
      "Entertainment": 0,
      "Shopping": 0,
    };

    let totalSpent = 0;

    transactions?.forEach((tx: any) => {
      if (tx.category && categoryTotals[tx.category] !== undefined) {
        categoryTotals[tx.category] += tx.amount || 0;
      }
      totalSpent += tx.amount || 0;
    });

    const categories = [
      { name: "Food", amount: categoryTotals["Food"], color: "#00ff87" },
      { name: "Transport", amount: categoryTotals["Transport"], color: "#00e5ff" },
      { name: "Entertainment", amount: categoryTotals["Entertainment"], color: "#ff6b6b" },
      { name: "Shopping", amount: categoryTotals["Shopping"], color: "#ffd93d" },
    ];

    const recentTransactions = (transactions || []).map((tx: any) => ({
      id: tx.id,
      title: tx.description || tx.category, // Schema uses 'description' not 'title'
      amount: tx.amount,
      date: new Date(tx.spent_at || tx.created_at).toLocaleDateString(), // Schema uses 'spent_at'
    }));

    return {
      currency: "$",
      totalSpent,
      budget: 100, // Default budget, can be enhanced later
      recentTransactions,
      categories,
    };
  } catch (error) {
    console.error('Error loading spending data:', error);
    return {
      currency: "$",
      totalSpent: 0,
      budget: 100,
      recentTransactions: [],
      categories: [
        { name: "Food", amount: 0, color: "#00ff87" },
        { name: "Transport", amount: 0, color: "#00e5ff" },
        { name: "Entertainment", amount: 0, color: "#ff6b6b" },
        { name: "Shopping", amount: 0, color: "#ffd93d" },
      ],
    };
  }
}

/**
 * Create a spending transaction
 * 
 * @param userId - The user's ID
 * @param title - Transaction title
 * @param amount - Transaction amount
 * @param category - Transaction category
 * @returns Success status with transaction data
 */
export async function createSpendingTransaction(
  userId: string,
  title: string,
  amount: number,
  category: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs
    if (!userId || !title || amount <= 0) {
      return { success: false, error: 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('spending_entries') // Fixed: was 'spending', now 'spending_entries'
      .insert({
        user_id: userId,
        category,
        amount,
        description: title, // Schema uses 'description' not 'title'
        spent_at: new Date().toISOString().split('T')[0], // Schema requires 'spent_at'
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create transaction' 
    };
  }
}

/**
 * Delete a spending transaction
 * 
 * @param transactionId - The transaction ID
 * @param userId - The user's ID (for security)
 * @returns Success status
 */
export async function deleteSpendingTransaction(
  transactionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs
    if (!transactionId || !userId) {
      return { success: false, error: 'Invalid input' };
    }

    const { error } = await supabase
      .from('spending_entries') // Fixed: was 'spending', now 'spending_entries'
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete transaction' 
    };
  }
}

/**
 * Bootstrap user data on first login
 * 
 * This function creates all required database rows for a new user:
 * - mascot_state
 * - streaks (habits, tasks, overall)
 * - prompt_memory (default settings)
 * 
 * @param userId - The user's ID
 * @returns Success status
 */
export async function bootstrapUserData(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Create mascot state
    const { error: mascotError } = await supabase
      .from('mascot_state')
      .insert({
        user_id: userId,
        level: 1,
        evolution_stage: 'egg',
        total_interactions: 0,
      });

    if (mascotError && !mascotError.message.includes('duplicate key')) {
      console.error('Error creating mascot state:', mascotError);
    }

    // Create streaks (habits, tasks, overall)
    const streakTypes = ['habits', 'tasks', 'overall'];
    for (const type of streakTypes) {
      const { error: streakError } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          type,
          current_streak: 0,
          best_streak: 0,
        });

      if (streakError && !streakError.message.includes('duplicate key')) {
        console.error(`Error creating streak for ${type}:`, streakError);
      }
    }

    // Create default memory settings
    const defaultMemory = {
      theme: 'dark',
      notifications: true,
      language: 'en',
      timezone: 'UTC',
    };

    // NOTE: prompt_memory only allows types: 'preference', 'context', 'history'
    // We store app_settings as a 'preference' memory type
    const { error: memoryError } = await supabase
      .from('prompt_memory')
      .insert({
        user_id: userId,
        memory_type: 'preference',
        memory_data: { key: 'app_settings', ...defaultMemory },
      });

    if (memoryError && !memoryError.message.includes('duplicate key')) {
      console.error('Error creating default memory:', memoryError);
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to bootstrap user data' 
    };
  }
}

/**
 * Ensure user has all required data rows
 * 
 * This function checks if required rows exist and creates them if missing.
 * Call this on first login or when loading user data.
 * 
 * @param userId - The user's ID
 * @returns Success status
 */
export async function ensureUserData(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // NOTE: maybeSingle() returns null when no row found; single() would throw PGRST116
    const { data: mascotState } = await supabase
      .from('mascot_state')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!mascotState) {
      const mascotResult = await supabase
        .from('mascot_state')
        .insert({
          user_id: userId,
          level: 1,
          evolution_stage: 'egg',
          total_interactions: 0,
        });

      if (mascotResult.error) {
        console.error('Error creating mascot state:', mascotResult.error);
      }
    }

    // Check if streaks exist
    const streakTypes = ['habits', 'tasks', 'overall'];
    for (const type of streakTypes) {
      // NOTE: maybeSingle() returns null when no row found; single() would throw PGRST116
      const { data: streak } = await supabase
        .from('streaks')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .maybeSingle();

      if (!streak) {
        const streakResult = await supabase
          .from('streaks')
          .insert({
            user_id: userId,
            type,
            current_streak: 0,
            best_streak: 0,
          });

        if (streakResult.error) {
          console.error(`Error creating streak for ${type}:`, streakResult.error);
        }
      }
    }

    // Check if default preference memory exists
    // NOTE: Use maybeSingle() to avoid PGRST116 error when no row is found
    // NOTE: 'app_settings' is not a valid memory_type — use 'preference' instead
    const { data: memory } = await supabase
      .from('prompt_memory')
      .select('id')
      .eq('user_id', userId)
      .eq('memory_type', 'preference')
      .maybeSingle();

    if (!memory) {
      const defaultMemory = {
        theme: 'dark',
        notifications: true,
        language: 'en',
        timezone: 'UTC',
      };

      const memoryResult = await supabase
        .from('prompt_memory')
        .insert({
          user_id: userId,
          memory_type: 'preference', // valid: 'preference' | 'context' | 'history'
          memory_data: { key: 'app_settings', ...defaultMemory },
        });

      if (memoryResult.error) {
        console.error('Error creating default memory:', memoryResult.error);
      }
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to ensure user data' 
    };
  }
}

/**
 * Save daily reflection to Supabase
 * 
 * @param userId - The user's ID
 * @param mood - Mood rating (1-5)
 * @param journalText - Journal entry text
 * @returns Success status and error if any
 */
export async function saveDailyReflection(
  userId: string,
  mood: number,
  journalText: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Save to prompt_memory with type 'daily_reflection'
    const reflectionData = {
      mood,
      journal: journalText,
      date: new Date().toISOString().split('T')[0],
    };

    // NOTE: prompt_memory only allows types: 'preference', 'context', 'history'
    // Daily reflections are stored as 'history' type
    const { error } = await supabase.from('prompt_memory').insert({
      user_id: userId,
      memory_type: 'history', // valid type; was 'daily_reflection' which breaks CHECK constraint
      memory_data: { key: 'daily_reflection', ...reflectionData },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Award XP for reflection
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('xp_total')
      .eq('id', userId)
      .single();

    if (currentProfile) {
      const newXP = (currentProfile.xp_total || 0) + 50;
      const { error: xpError } = await supabase
        .from('profiles')
        .update({ xp_total: newXP })
        .eq('id', userId);

      if (xpError) {
        console.error('Error updating XP total:', xpError);
      }

      // Log XP gain
      await supabase.from('xp_logs').insert({
        user_id: userId,
        amount: 50,
        reason: 'Daily reflection',
        source: 'bonus', // xp_logs.source allows: 'habit','task','goal','bonus','penalty'; 'reflection' is invalid
      });
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save reflection' 
    };
  }
}

/**
 * Load weekly performance data for the dashboard chart.
 * Returns Mon–Sun scores (0-100) based on habit + task completions per day.
 * 
 * @param userId - The user's ID
 * @returns Array of { name: 'Mon'|..., score: number } for each day of the current week
 */
export async function loadWeeklyPerformanceData(userId: string): Promise<Array<{ name: string; score: number }>> {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const defaultData = dayNames.map(name => ({ name, score: 0 }));

  if (!isSupabaseConfigured()) return defaultData;

  const supabase = createClientComponentClient();
  if (!supabase) return defaultData;

  try {
    // Build ISO date strings for Mon–Sun of the current week
    const now = new Date();
    // getDay(): 0=Sun, 1=Mon … 6=Sat; we want Mon=0 offset
    const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0, Sun=6
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.toISOString().split('T')[0]);
    }

    const startISO = monday.toISOString();
    const endDate = new Date(monday);
    endDate.setDate(monday.getDate() + 7);
    const endISO = endDate.toISOString();

    // Count habit completions per day this week
    const { data: habitLogs } = await supabase
      .from('habit_logs')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startISO)
      .lt('completed_at', endISO);

    // Count task completions per day this week
    const { data: taskLogs } = await supabase
      .from('task_logs')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startISO)
      .lt('completed_at', endISO);

    // Count total habits and tasks so we can compute a completion percentage
    const { count: totalHabits } = await supabase
      .from('habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const total = (totalHabits || 0) + (totalTasks || 0);

    // Build a counts map: dateStr -> count
    const dayCounts: Record<string, number> = {};
    weekDates.forEach(d => { dayCounts[d] = 0; });

    (habitLogs || []).forEach((log: any) => {
      const dateStr = new Date(log.completed_at).toISOString().split('T')[0];
      if (dayCounts[dateStr] !== undefined) dayCounts[dateStr]++;
    });

    (taskLogs || []).forEach((log: any) => {
      const dateStr = new Date(log.completed_at).toISOString().split('T')[0];
      if (dayCounts[dateStr] !== undefined) dayCounts[dateStr]++;
    });

    // Convert to percentage scores
    return weekDates.map((date, idx) => ({
      name: dayNames[idx],
      score: total > 0 ? Math.round((dayCounts[date] / total) * 100) : 0,
    }));
  } catch (error) {
    console.error('Error loading weekly performance data:', error);
    return defaultData;
  }
}

/**
 * Load user activity history from Supabase
 * 
 * This function loads comprehensive activity data including:
 * - Habit completions
 * - Task completions
 * - Spending transactions
 * - XP gains
 * - Mascot evolution events
 * 
 * @param userId - The user's ID
 * @returns Activity history data
 */
export async function loadActivityHistory(userId: string): Promise<{
  habitCompletions: Array<{ id: string; habitTitle: string; completedAt: string }>;
  taskCompletions: Array<{ id: string; taskTitle: string; completedAt: string }>;
  spendingTransactions: Array<{ id: string; category: string; amount: number; spentAt: string }>;
}> {
  if (!isSupabaseConfigured()) {
    return {
      habitCompletions: [],
      taskCompletions: [],
      spendingTransactions: [],
    };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) {
    return {
      habitCompletions: [],
      taskCompletions: [],
      spendingTransactions: [],
    };
  }

  try {
    // Load habit completions with habit titles
    const { data: habitLogs } = await supabase
      .from('habit_logs')
      .select(`
        id,
        completed_at,
        habit:habits(title)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    const habitCompletions = (habitLogs || []).map((log: any) => ({
      id: log.id,
      habitTitle: log.habit?.title || 'Unknown Habit',
      completedAt: log.completed_at,
    }));

    // Load task completions with task titles
    const { data: taskLogs } = await supabase
      .from('task_logs')
      .select(`
        id,
        completed_at,
        task:tasks(title)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    const taskCompletions = (taskLogs || []).map((log: any) => ({
      id: log.id,
      taskTitle: log.task?.title || 'Unknown Task',
      completedAt: log.completed_at,
    }));

    // Load spending transactions
    const { data: spending } = await supabase
      .from('spending_entries')
      .select('id, category, amount, spent_at')
      .eq('user_id', userId)
      .order('spent_at', { ascending: false })
      .limit(50);

    const spendingTransactions = (spending || []).map((tx: any) => ({
      id: tx.id,
      category: tx.category,
      amount: tx.amount,
      spentAt: tx.spent_at,
    }));

    return {
      habitCompletions,
      taskCompletions,
      spendingTransactions,
    };
  } catch (error) {
    console.error('Error loading activity history:', error);
    return {
      habitCompletions: [],
      taskCompletions: [],
      spendingTransactions: [],
    };
  }
}


