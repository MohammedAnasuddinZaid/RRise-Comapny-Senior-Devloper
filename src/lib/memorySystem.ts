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
 * MEMORY SCOPING & SECURITY:
 * - All memory operations are scoped to user_id
 * - Users can only access their own memory data
 * - Memory is stored in prompt_memory table with user_id foreign key
 * - Code-level memory types are grouped into 3 database types for schema constraints
 * 
 * Memory is used by Alex AI and the template engine to personalize responses.
 * 
 * Note: Database table is 'prompt_memory' (not 'user_memory')
 */

import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';

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
 * Helper function to map code-level memory types onto the 3 allowed database memory types:
 * - 'preference'
 * - 'context'
 * - 'history'
 * 
 * This satisfies the CHECK constraint in the Supabase schema while letting
 * the application code use specific keys for setting preferences, goals, loop history, etc.
 */
function getDBMemoryType(type: MemoryType | string): 'preference' | 'context' | 'history' {
  if (type === 'preferences' || type === 'goals' || type === 'interests' || type === 'app_settings') {
    return 'preference';
  }
  if (type === 'template_history' || type === 'spending_habits') {
    return 'history';
  }
  return 'context'; // Fallback for daily reflections, accountability notes, etc.
}

/**
 * Load user memory by type.
 * Since multiple code memory types are grouped under the same database column value,
 * this function loads the row, parses the JSON, and retrieves the specific nested key.
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory to load (e.g. 'app_settings')
 * @returns Memory value or null if not found
 */
export async function loadMemory(
  userId: string,
  memoryType: MemoryType
): Promise<any | null> {
  if (!isSupabaseConfigured()) return null;
  
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  try {
    const dbType = getDBMemoryType(memoryType);
    
    const { data, error } = await supabase
      .from('prompt_memory')
      .select('memory_data')
      .eq('user_id', userId)
      .eq('memory_type', dbType)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading memory:', error);
      return null;
    }

    if (data && data.length > 0 && data[0]?.memory_data) {
      const memoryRow = data[0];
      const parsedData = typeof memoryRow.memory_data === 'string'
        ? JSON.parse(memoryRow.memory_data)
        : memoryRow.memory_data;
      
      // Return only the specific nested property requested by the code
      return parsedData[memoryType] ?? null;
    }

    return null;
  } catch (error) {
    console.error('Error loading memory:', error);
    return null;
  }
}

/**
 * Save user memory.
 * Fetches the existing row, merges the new value at the specified key,
 * and updates or inserts the consolidated row.
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory (e.g. 'goals')
 * @param memoryValue - The value to store
 * @param importance - Importance level (unused in DB, left for compatibility)
 * @returns Success status and error if any
 */
export async function saveMemory(
  userId: string,
  memoryType: MemoryType,
  memoryValue: any,
  importance: MemoryImportance = 'medium'
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const dbType = getDBMemoryType(memoryType);

    // Get the existing row for this database group first
    const { data: existingRows, error: fetchError } = await supabase
      .from('prompt_memory')
      .select('id, memory_data')
      .eq('user_id', userId)
      .eq('memory_type', dbType)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

    let currentMemoryData: Record<string, any> = {};

    if (existing) {
      try {
        currentMemoryData = typeof existing.memory_data === 'string'
          ? JSON.parse(existing.memory_data)
          : existing.memory_data || {};
      } catch {
        currentMemoryData = {};
      }
    }

    // Set or overwrite the specific sub-field
    currentMemoryData[memoryType] = memoryValue;

    let error;

    if (existing) {
      // Update the existing consolidated row
      const result = await supabase
        .from('prompt_memory')
        .update({ 
          memory_data: currentMemoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      error = result.error;
    } else {
      // Insert a new row for this database group
      const result = await supabase
        .from('prompt_memory')
        .insert({
          user_id: userId,
          memory_type: dbType,
          memory_data: currentMemoryData,
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
 * Load all user memories consolidated into a single key-value map.
 * 
 * @param userId - The user's ID
 * @returns All memories flattened into a single object
 */
export async function loadAllMemories(userId: string): Promise<Record<MemoryType, any>> {
  if (!isSupabaseConfigured()) return {} as Record<MemoryType, any>;
  
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
      // Merge all consolidated key-value pairs into a single map
      for (const row of data) {
        try {
          const parsed = typeof row.memory_data === 'string'
            ? JSON.parse(row.memory_data)
            : row.memory_data || {};
          
          Object.assign(memories, parsed);
        } catch (e) {
          console.error('Error parsing memory_data:', e);
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
 * Update user preferences memory.
 * 
 * @param userId - The user's ID
 * @param preferences - User preferences object
 * @returns Success status
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
 * Add a single goal to the user's goals array memory.
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
 * Add starting plan to history in memory.
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
  
  if (templateHistory.length > 50) {
    templateHistory.shift();
  }
  
  return saveMemory(userId, 'template_history', templateHistory, 'medium');
}

/**
 * Delete a specific sub-type of user memory.
 * Removes the key from the consolidated JSON and deletes the row if it becomes empty.
 * 
 * @param userId - The user's ID
 * @param memoryType - The type of memory to delete (e.g. 'interests')
 * @returns Success status and error if any
 */
export async function deleteMemory(
  userId: string,
  memoryType: MemoryType
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const dbType = getDBMemoryType(memoryType);

    const { data: existingRows, error: fetchError } = await supabase
      .from('prompt_memory')
      .select('id, memory_data')
      .eq('user_id', userId)
      .eq('memory_type', dbType)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

    if (!existing) {
      return { success: true };
    }

    let currentMemoryData: Record<string, any> = {};
    try {
      currentMemoryData = typeof existing.memory_data === 'string'
        ? JSON.parse(existing.memory_data)
        : existing.memory_data || {};
    } catch {
      currentMemoryData = {};
    }

    // Delete the specific sub-field
    delete currentMemoryData[memoryType];

    let error;
    if (Object.keys(currentMemoryData).length === 0) {
      // Clean up and delete the database row if no keys remain
      const result = await supabase
        .from('prompt_memory')
        .delete()
        .eq('id', existing.id);
      error = result.error;
    } else {
      // Update with the nested key removed
      const result = await supabase
        .from('prompt_memory')
        .update({ 
          memory_data: currentMemoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      error = result.error;
    }

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
 * Update user memory (explicit update wrapper)
 */
export async function updateMemory(
  userId: string,
  memoryType: MemoryType,
  memoryValue: any
): Promise<{ success: boolean; error?: string }> {
  return saveMemory(userId, memoryType, memoryValue, 'medium');
}
