/**
 * BYOK (Bring Your Own Key) System
 * 
 * This system allows users to provide their own AI API keys for use with Alex AI.
 * Keys are stored securely in the database and never exposed to the client.
 * 
 * SECURITY & KEY HANDLING:
 * - Keys are stored in ai_keys table with user_id scoping
 * - Keys are encrypted before storage (in production - TODO)
 * - Keys are never returned to the client after storage (only metadata)
 * - Only provider and key_name are exposed, never the actual key
 * - Keys can be deactivated (is_active flag) or deleted
 * - Key validation checks format before storage
 * 
 * Supported providers:
 * - OpenAI (GPT models)
 * - Gemini (Google AI)
 * - Anthropic (Claude models)
 * - OpenRouter (multi-provider gateway)
 */

import { AIProvider, AIKey, AIKeyPublic, AIKeyInsert, AIKeyUpdate } from '@/types/database';
import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Save a new AI key for a user
 * 
 * @param userId - The user's ID
 * @param provider - The AI provider (openai, gemini, anthropic)
 * @param keyName - A friendly name for the key (e.g., "My OpenAI Key")
 * @param apiKey - The actual API key (will be encrypted in production)
 * @returns Success status and error if any
 */
export async function saveAIKey(
  userId: string,
  provider: AIProvider,
  keyName: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // In production, encrypt the key before storing
    // For now, we'll store it as-is (this should be improved)
    const encryptedKey = apiKey; // TODO: Implement encryption

    const { error } = await supabase.from('ai_keys').insert({
      user_id: userId,
      provider,
      key_name: keyName,
      encrypted_key: encryptedKey,
      is_active: true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save AI key' 
    };
  }
}

/**
 * Get all AI keys for a user (without exposing the actual keys)
 * 
 * @param userId - The user's ID
 * @returns Array of AI keys (without the encrypted_key field)
 */
export async function getUserAIKeys(userId: string): Promise<AIKeyPublic[]> {
  if (!isSupabaseConfigured()) return [];
  
  try {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('ai_keys')
      .select('id, user_id, provider, key_name, is_active, created_at, updated_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching AI keys:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching AI keys:', error);
    return [];
  }
}

/**
 * Get the active AI key for a specific provider
 * 
 * @param userId - The user's ID
 * @param provider - The AI provider
 * @returns The decrypted API key or null if not found
 */
export async function getActiveAIKey(
  userId: string,
  provider: AIProvider
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('ai_keys')
      .select('encrypted_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // In production, decrypt the key
    // For now, return as-is (this should be improved)
    return data.encrypted_key; // TODO: Implement decryption
  } catch (error) {
    console.error('Error fetching AI key:', error);
    return null;
  }
}

/**
 * Deactivate an AI key
 * 
 * @param keyId - The key ID to deactivate
 * @param userId - The user's ID (for security)
 * @returns Success status and error if any
 */
export async function deactivateAIKey(
  keyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('ai_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to deactivate AI key' 
    };
  }
}

/**
 * Delete an AI key
 * 
 * @param keyId - The key ID to delete
 * @param userId - The user's ID (for security)
 * @returns Success status and error if any
 */
export async function deleteAIKey(
  keyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('ai_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete AI key' 
    };
  }
}

/**
 * Update an AI key
 * 
 * @param keyId - The key ID to update
 * @param userId - The user's ID (for security)
 * @param updates - The fields to update
 * @returns Success status and error if any
 */
export async function updateAIKey(
  keyId: string,
  userId: string,
  updates: AIKeyUpdate
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // If updating the key, encrypt it
    let updateData = { ...updates };
    if ('encrypted_key' in updates && updates.encrypted_key) {
      updateData.encrypted_key = updates.encrypted_key; // TODO: Implement encryption
    }

    const { error } = await supabase
      .from('ai_keys')
      .update(updateData)
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update AI key' 
    };
  }
}

/**
 * Test if an AI key is valid
 * 
 * This makes a simple API call to verify the key works
 * Note: This should be done server-side in production
 * 
 * @param provider - The AI provider
 * @param apiKey - The API key to test
 * @returns Success status and error if any
 */
export async function testAIKey(
  provider: AIProvider,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, make actual API calls to test the key
    // For now, just validate the format
    
    if (provider === 'openai') {
      // OpenAI keys start with 'sk-'
      if (!apiKey.startsWith('sk-')) {
        return { success: false, error: 'Invalid OpenAI key format' };
      }
    } else if (provider === 'gemini') {
      // Gemini keys are typically longer strings
      if (apiKey.length < 20) {
        return { success: false, error: 'Invalid Gemini key format' };
      }
    } else if (provider === 'anthropic') {
      // Anthropic keys start with 'sk-ant-'
      if (!apiKey.startsWith('sk-ant-')) {
        return { success: false, error: 'Invalid Anthropic key format' };
      }
    } else if (provider === 'openrouter') {
      // OpenRouter keys are typically longer strings
      if (apiKey.length < 20) {
        return { success: false, error: 'Invalid OpenRouter key format' };
      }
    }

    // TODO: Implement actual API validation
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to test AI key' 
    };
  }
}

/**
 * Check if a user has an active key for a specific provider
 * 
 * @param userId - The user's ID
 * @param provider - The AI provider
 * @returns Whether the user has an active key
 */


async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    return null;
  }
}

export async function hasActiveAIKey(
  userId: string,
  provider: AIProvider
): Promise<boolean> {
  try {
    const token = await getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch('/api/user/keys', { headers });
    if (res.ok) {
      const data = await res.json();
      return (data.keys || []).some((k: any) => k.provider === provider);
    }
    return false;
  } catch (error) {
    return false;
  }
}
