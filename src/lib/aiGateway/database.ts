/**
 * AI Gateway Database Operations
 * 
 * Functions for interacting with the AI Gateway database schema
 */

import { createClientComponentClient, isSupabaseConfigured } from '../supabase';
import type { AIProviderType, AIConfig } from './types';

export interface APIKeyRecord {
  id: string;
  user_id: string;
  provider: AIProviderType;
  selected_model: string;
  encrypted_key: string;
  is_active: boolean;
  last_used: string | null;
  token_usage: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderConfig {
  id: string;
  provider: AIProviderType;
  enabled: boolean;
  available_plans: ('free' | 'pro' | 'ultra')[];
  default_model: string;
  requires_api_key: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Save or update an API key configuration
 */
export async function saveAPIKey(
  userId: string,
  provider: AIProviderType,
  model: string,
  apiKey: string
): Promise<APIKeyRecord | null> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('ai_keys')
      .upsert({
        user_id: userId,
        provider,
        selected_model: model,
        key_name: 'BYOK Key',
        encrypted_key: apiKey, // TODO: Encrypt before storing
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[AI Gateway DB] Error saving API key:', error);
    return null;
  }
}

/**
 * Get API key configuration for a user and provider
 */
export async function getAPIKey(
  userId: string,
  provider: AIProviderType
): Promise<APIKeyRecord | null> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('ai_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[AI Gateway DB] Error getting API key:', error);
    return null;
  }
}

/**
 * Get all API key configurations for a user
 */
export async function getAllAPIKeys(userId: string): Promise<APIKeyRecord[]> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('ai_keys')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[AI Gateway DB] Error getting all API keys:', error);
    return [];
  }
}

/**
 * Delete an API key configuration
 */
export async function deleteAPIKey(
  userId: string,
  provider: AIProviderType
): Promise<boolean> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('ai_keys')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[AI Gateway DB] Error deleting API key:', error);
    return false;
  }
}

/**
 * Update last used timestamp and token usage
 */
export async function updateUsage(
  userId: string,
  provider: AIProviderType,
  tokensUsed: number
): Promise<boolean> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('ai_keys')
      .update({
        last_used: new Date().toISOString(),
        token_usage: await incrementTokenUsage(userId, provider, tokensUsed),
      })
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[AI Gateway DB] Error updating usage:', error);
    return false;
  }
}

/**
 * Increment token usage (helper function)
 */
async function incrementTokenUsage(
  userId: string,
  provider: AIProviderType,
  additionalTokens: number
): Promise<number> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return 0;

  try {
    const { data } = await supabase
      .from('ai_keys')
      .select('token_usage')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    const currentUsage = data?.token_usage || 0;
    return currentUsage + additionalTokens;
  } catch (error) {
    console.error('[AI Gateway DB] Error incrementing usage:', error);
    return 0;
  }
}

/**
 * Get provider configuration
 */
export async function getProviderConfig(
  provider: AIProviderType
): Promise<ProviderConfig | null> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('provider_config')
      .select('*')
      .eq('provider', provider)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, return default config
        return getDefaultProviderConfig(provider);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[AI Gateway DB] Error getting provider config:', error);
    return getDefaultProviderConfig(provider);
  }
}

/**
 * Get all provider configurations
 */
export async function getAllProviderConfigs(): Promise<ProviderConfig[]> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('provider_config')
      .select('*')
      .order('provider');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[AI Gateway DB] Error getting all provider configs:', error);
    return [];
  }
}

/**
 * Update provider configuration (admin only)
 */
export async function updateProviderConfig(
  provider: AIProviderType,
  config: Partial<ProviderConfig>
): Promise<boolean> {
  const supabase = createClientComponentClient();
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('provider_config')
      .update({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .eq('provider', provider);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[AI Gateway DB] Error updating provider config:', error);
    return false;
  }
}

/**
 * Get default provider configuration (fallback)
 */
function getDefaultProviderConfig(provider: AIProviderType): ProviderConfig {
  const defaults: Record<AIProviderType, ProviderConfig> = {
    gemini: {
      id: '',
      provider: 'gemini',
      enabled: true,
      available_plans: ['free', 'pro', 'ultra'],
      default_model: 'gemini-2.5-flash',
      requires_api_key: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    openai: {
      id: '',
      provider: 'openai',
      enabled: true,
      available_plans: ['pro', 'ultra'],
      default_model: 'gpt-5',
      requires_api_key: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    anthropic: {
      id: '',
      provider: 'anthropic',
      enabled: true,
      available_plans: ['pro', 'ultra'],
      default_model: 'claude-sonnet-4',
      requires_api_key: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    groq: {
      id: '',
      provider: 'groq',
      enabled: true,
      available_plans: ['free', 'pro', 'ultra'],
      default_model: 'llama-3.3-70b-versatile',
      requires_api_key: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    openrouter: {
      id: '',
      provider: 'openrouter',
      enabled: true,
      available_plans: ['pro', 'ultra'],
      default_model: 'anthropic/claude-sonnet-4',
      requires_api_key: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  return defaults[provider];
}
