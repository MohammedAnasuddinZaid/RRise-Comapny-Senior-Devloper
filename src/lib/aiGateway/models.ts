/**
 * Model Registry
 * 
 * Manages dynamic model loading from provider APIs
 */

import type { AIProviderType, AIModel } from './types';
import { aiGateway } from './gateway';

class ModelRegistry {
  private modelCache: Map<string, AIModel[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch models for a provider with caching
   */
  async fetchModels(provider: AIProviderType, apiKey: string, forceRefresh = false): Promise<AIModel[]> {
    const cacheKey = `${provider}:${apiKey}`;
    const now = Date.now();

    // Check cache
    if (!forceRefresh) {
      const cached = this.modelCache.get(cacheKey);
      const expiry = this.cacheExpiry.get(cacheKey);

      if (cached && expiry && now < expiry) {
        console.log('[Model Registry] Using cached models for:', provider);
        return cached;
      }
    }

    // Fetch from provider
    console.log('[Model Registry] Fetching models for:', provider);
    const models = await aiGateway.fetchModels(provider, apiKey);

    // Cache results
    this.modelCache.set(cacheKey, models);
    this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

    return models;
  }

  /**
   * Clear cache for a provider
   */
  clearCache(provider: AIProviderType, apiKey: string) {
    const cacheKey = `${provider}:${apiKey}`;
    this.modelCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.modelCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get default model for a provider
   */
  getDefaultModel(provider: AIProviderType): string {
    const defaults: Record<AIProviderType, string> = {
      gemini: 'gemini-2.5-flash',
      openai: 'gpt-5',
      anthropic: 'claude-sonnet-4',
      groq: 'llama-3.3-70b-versatile',
      openrouter: 'anthropic/claude-sonnet-4',
    };

    return defaults[provider] || '';
  }
}

export const modelRegistry = new ModelRegistry();
