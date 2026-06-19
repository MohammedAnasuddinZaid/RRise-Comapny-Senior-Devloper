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
      habits.map(async (habit) => {
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
      tasks.map(async (task) => {
        const { data: logs } = await supabase
          .from('task_logs')
          .select('*')
          .eq('task_id', task.id)
          .gte('completed_at', todayStart)
          .lte('completed_at', todayEnd)
          .order('completed_at', { ascending: false });

        const completedToday = logs && logs.length > 0;

        return {
          ...task,
          completed: completedToday || task.status === 'completed',
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
    const { data, error } = await supabase
      .from('habits')
      .update({ title, icon })
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
    const { data, error } = await supabase
      .from('mascot_state')
      .select('*')
      .eq('user_id', userId)
      .single();

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
      // Check if already completed today
      const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', today)
        .single();

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

        // Update streak
        const { data: currentStreak } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', userId)
          .eq('type', 'habits')
          .single();

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
      // Remove today's completion log (uncheck)
      const { error: deleteError } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', today);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Decrease XP total when unchecking
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('xp_total')
        .eq('id', userId)
        .single();

      if (currentProfile) {
        const newXP = Math.max((currentProfile.xp_total || 0) - 10, 0);
        const { error: xpError } = await supabase
          .from('profiles')
          .update({ xp_total: newXP })
          .eq('id', userId);

        if (xpError) {
          console.error('Error updating XP total:', xpError);
        }
      }
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
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Security: Validate inputs to prevent injection
    if (!taskId || !userId) {
      return { success: false, error: 'Invalid input' };
    }

    // Update task status instead of completed field
    const { error } = await supabase
      .from('tasks')
      .update({ status: completed ? 'completed' : 'pending' })
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
        xp_earned: 5, // Default XP reward
      });

      // Update user XP total in profiles table
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('xp_total')
        .eq('id', userId)
        .single();

      if (currentProfile) {
        const newXP = (currentProfile.xp_total || 0) + 5;
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
        amount: 5,
        reason: 'Task completion',
        source: 'task',
      });

      // Update streak
      const { data: currentStreak } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .eq('type', 'tasks')
        .single();

      if (currentStreak) {
        const newStreak = (currentStreak.current_streak || 0) + 1;
        const { error: streakError } = await supabase
          .from('streaks')
          .update({ 
            current_streak: newStreak,
            last_activity_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('type', 'tasks');

        if (streakError) {
          console.error('Error updating streak:', streakError);
        }
      }
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

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        title,
        icon,
        completed: false,
        streak: 0,
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

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        due_date: dueTime,
        completed: false,
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

    transactions?.forEach(tx => {
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

    const recentTransactions = (transactions || []).map(tx => ({
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

    const { error: memoryError } = await supabase
      .from('prompt_memory')
      .insert({
        user_id: userId,
        memory_type: 'app_settings',
        memory_data: defaultMemory,
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
    // Check if mascot state exists
    const { data: mascotState } = await supabase
      .from('mascot_state')
      .select('id')
      .eq('user_id', userId)
      .single();

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
      const { data: streak } = await supabase
        .from('streaks')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .single();

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

    // Check if default memory exists
    const { data: memory } = await supabase
      .from('prompt_memory')
      .select('id')
      .eq('user_id', userId)
      .eq('memory_type', 'app_settings')
      .single();

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
          memory_type: 'app_settings',
          memory_data: defaultMemory,
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
  habitCompletions: Array<{ id: string; habitTitle: string; completedAt: string; xpEarned: number }>;
  taskCompletions: Array<{ id: string; taskTitle: string; completedAt: string; xpEarned: number }>;
  spendingTransactions: Array<{ id: string; category: string; amount: number; spentAt: string }>;
  xpGains: Array<{ id: string; amount: number; reason: string; source: string; createdAt: string }>;
}> {
  if (!isSupabaseConfigured()) {
    return {
      habitCompletions: [],
      taskCompletions: [],
      spendingTransactions: [],
      xpGains: [],
    };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) {
    return {
      habitCompletions: [],
      taskCompletions: [],
      spendingTransactions: [],
      xpGains: [],
    };
  }

  try {
    // Load habit completions with habit titles
    const { data: habitLogs } = await supabase
      .from('habit_logs')
      .select(`
        id,
        completed_at,
        xp_earned,
        habit:habits(title)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    const habitCompletions = (habitLogs || []).map((log: any) => ({
      id: log.id,
      habitTitle: log.habit?.title || 'Unknown Habit',
      completedAt: log.completed_at,
      xpEarned: log.xp_earned || 0,
    }));

    // Load task completions with task titles
    const { data: taskLogs } = await supabase
      .from('task_logs')
      .select(`
        id,
        completed_at,
        xp_earned,
        task:tasks(title)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    const taskCompletions = (taskLogs || []).map((log: any) => ({
      id: log.id,
      taskTitle: log.task?.title || 'Unknown Task',
      completedAt: log.completed_at,
      xpEarned: log.xp_earned || 0,
    }));

    // Load spending transactions
    const { data: spending } = await supabase
      .from('spending_entries')
      .select('id, category, amount, spent_at')
      .eq('user_id', userId)
      .order('spent_at', { ascending: false })
      .limit(50);

    const spendingTransactions = (spending || []).map(tx => ({
      id: tx.id,
      category: tx.category,
      amount: tx.amount,
      spentAt: tx.spent_at,
    }));

    // Load XP gains
    const { data: xpLogs } = await supabase
      .from('xp_logs')
      .select('id, amount, reason, source, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const xpGains = (xpLogs || []).map(log => ({
      id: log.id,
      amount: log.amount,
      reason: log.reason,
      source: log.source,
      createdAt: log.created_at,
    }));

    return {
      habitCompletions,
      taskCompletions,
      spendingTransactions,
      xpGains,
    };
  } catch (error) {
    console.error('Error loading activity history:', error);
    return {
      habitCompletions: [],
      taskCompletions: [],
      spendingTransactions: [],
      xpGains: [],
    };
  }
}


