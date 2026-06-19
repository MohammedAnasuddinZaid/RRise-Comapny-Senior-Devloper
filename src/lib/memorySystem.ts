/**
 * Memory System Utilities
 * 
 * This file handles user memory operations for personalization.
 * Memory includes:
 * - User preferences (age range, study level, fitness level)
 * - Goals and interests
 * - Template history
 * - App theme preference
 * - Spending habits
 * - Accountability notes
 * 
 * Memory is used by Alex AI and the template engine to personalize responses.
 * 
 * Note: Database table is 'prompt_memory' (not 'user_memory')
 */

import { createClientComponentClient } from '@/lib/supabase';

/**
 * Memory types for categorization
 */
export type MemoryType = 
  | 'preferences'
  | 'goals'
  | 'interests'
  | 'template_history'
  | 'spending_habits'
  | 'accountability_notes'
  | 'app_settings';

/**
 * Memory importance levels
 */
export type MemoryImportance = 'low' | 'medium' | 'high';

/**
 * Load user memory by type
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory to load
 * @returns Memory value or null if not found
 */
export async function loadMemory(
  userId: string,
  memoryType: MemoryType
): Promise<any | null> {
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('prompt_memory') // Fixed: Database table is 'prompt_memory' (not 'user_memory')
      .select('memory_data')
      .eq('user_id', userId)
      .eq('memory_type', memoryType)
      .single();

    if (error) {
      console.error('Error loading memory:', error);
      return null;
    }

    if (data?.memory_data) {
      try {
        return typeof data.memory_data === 'string' 
          ? JSON.parse(data.memory_data) 
          : data.memory_data;
      } catch {
        return data.memory_data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error loading memory:', error);
    return null;
  }
}

/**
 * Save user memory
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory
 * @param memoryValue - The memory value (will be JSON stringified if object)
 * @param importance - Importance level for memory
 * @returns Success status and error if any
 */
export async function saveMemory(
  userId: string,
  memoryType: MemoryType,
  memoryValue: any,
  importance: MemoryImportance = 'medium'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const valueToStore = typeof memoryValue === 'object' 
      ? JSON.stringify(memoryValue) 
      : memoryValue;

    // Check if memory already exists
    const { data: existing } = await supabase
      .from('prompt_memory')
      .select('id')
      .eq('user_id', userId)
      .eq('memory_type', memoryType)
      .single();

    let error;

    if (existing) {
      // Update existing memory
      const result = await supabase
        .from('prompt_memory')
        .update({ 
          memory_data: valueToStore, // Fixed: Schema uses 'memory_data' not 'memory_value'
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      error = result.error;
    } else {
      // Create new memory
      const result = await supabase
        .from('prompt_memory')
        .insert({
          user_id: userId,
          memory_type: memoryType,
          memory_data: valueToStore, // Fixed: Schema uses 'memory_data' not 'memory_value'
          // Note: 'importance' field doesn't exist in schema
        });
      error = result.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save memory' 
    };
  }
}

/**
 * Load all user memories
 * 
 * @param userId - The user's ID
 * @returns All memories for the user
 */
export async function loadAllMemories(userId: string): Promise<Record<MemoryType, any>> {
  const supabase = createClientComponentClient();
  if (!supabase) return {} as Record<MemoryType, any>;

  try {
    const { data, error } = await supabase
      .from('prompt_memory')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading all memories:', error);
      return {} as Record<MemoryType, any>;
    }

    const memories: Record<MemoryType, any> = {} as Record<MemoryType, any>;

    if (data) {
      for (const memory of data) {
        try {
          memories[memory.memory_type as MemoryType] = JSON.parse(memory.memory_data);
        } catch {
          memories[memory.memory_type as MemoryType] = memory.memory_data;
        }
      }
    }

    return memories;
  } catch (error) {
    console.error('Error loading all memories:', error);
    return {} as Record<MemoryType, any>;
  }
}

/**
 * Update user preferences
 * 
 * @param userId - The user's ID
 * @param preferences - User preferences object
 * @returns Success status and error if any
 */
export async function updatePreferences(
  userId: string,
  preferences: {
    age_range?: string | null;
    study_level?: string | null;
    fitness_level?: string | null;
    goals?: string[];
    interests?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  return saveMemory(userId, 'preferences', preferences, 'high');
}

/**
 * Add goal to user memory
 * 
 * @param userId - The user's ID
 * @param goal - The goal to add
 * @returns Success status and error if any
 */
export async function addGoal(userId: string, goal: string): Promise<{ success: boolean; error?: string }> {
  const existingGoals = await loadMemory(userId, 'goals') || [];
  const goals = Array.isArray(existingGoals) ? existingGoals : [];
  
  if (!goals.includes(goal)) {
    goals.push(goal);
    return saveMemory(userId, 'goals', goals, 'high');
  }
  
  return { success: true };
}

/**
 * Add template to history
 * 
 * @param userId - The user's ID
 * @param templateId - The template ID
 * @param templateTitle - The template title
 * @returns Success status and error if any
 */
export async function addTemplateToHistory(
  userId: string,
  templateId: string,
  templateTitle: string
): Promise<{ success: boolean; error?: string }> {
  const history = await loadMemory(userId, 'template_history') || [];
  const templateHistory = Array.isArray(history) ? history : [];
  
  const entry = {
    template_id: templateId,
    template_title: templateTitle,
    used_at: new Date().toISOString(),
  };
  
  templateHistory.push(entry);
  
  // Keep only last 50 entries
  if (templateHistory.length > 50) {
    templateHistory.shift();
  }
  
  return saveMemory(userId, 'template_history', templateHistory, 'medium');
}

/**
 * Delete user memory by type
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory to delete
 * @returns Success status and error if any
 */
export async function deleteMemory(
  userId: string,
  memoryType: MemoryType
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('prompt_memory')
      .delete()
      .eq('user_id', userId)
      .eq('memory_type', memoryType);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete memory' 
    };
  }
}

/**
 * Update user memory (explicit update function)
 * This is a wrapper around saveMemory for clarity
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory to update
 * @param memoryValue - The new memory value
 * @returns Success status and error if any
 */
export async function updateMemory(
  userId: string,
  memoryType: MemoryType,
  memoryValue: any
): Promise<{ success: boolean; error?: string }> {
  return saveMemory(userId, memoryType, memoryValue, 'medium');
}
