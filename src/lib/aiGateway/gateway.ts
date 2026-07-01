/**
 * AI Gateway
 * 
 * Central dispatcher for AI provider requests
 * Routes requests to appropriate provider adapters
 */

import type { AIProviderType, AIModel, ConnectionTestResult, GenerationResult, GenerationOptions } from './types';
import { GeminiAdapter } from './adapters/gemini';
import { OpenAIAdapter } from './adapters/openai';
import { AnthropicAdapter } from './adapters/anthropic';
import { GroqAdapter } from './adapters/groq';
import { OpenRouterAdapter } from './adapters/openrouter';

class AIGateway {
  private adapters: Map<AIProviderType, any> = new Map();

  constructor() {
    // Initialize all provider adapters
    this.adapters.set('gemini', new GeminiAdapter());
    this.adapters.set('openai', new OpenAIAdapter());
    this.adapters.set('anthropic', new AnthropicAdapter());
    this.adapters.set('groq', new GroqAdapter());
    this.adapters.set('openrouter', new OpenRouterAdapter());
  }

  /**
   * Get adapter for a specific provider
   */
  private getAdapter(provider: AIProviderType) {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    return adapter;
  }

  /**
   * Fetch available models for a provider
   */
  async fetchModels(provider: AIProviderType, apiKey: string): Promise<AIModel[]> {
    const adapter = this.getAdapter(provider);
    return adapter.fetchModels(apiKey);
  }

  /**
   * Test connection to a provider
   */
  async testConnection(provider: AIProviderType, apiKey: string, model: string): Promise<ConnectionTestResult> {
    const adapter = this.getAdapter(provider);
    return adapter.testConnection(apiKey, model);
  }

  /**
   * Generate a response from an AI provider
   */
  async generateResponse(
    provider: AIProviderType,
    model: string,
    apiKey: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<GenerationResult> {
    console.log('[AI Gateway] Generating response:', { provider, model });
    
    const adapter = this.getAdapter(provider);
    return adapter.generateResponse(apiKey, model, prompt, options);
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): AIProviderType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get provider info
   */
  getProviderInfo(provider: AIProviderType) {
    const adapter = this.getAdapter(provider);
    return {
      type: adapter.type,
      name: adapter.name,
      baseUrl: adapter.baseUrl,
    };
  }
}

// Singleton instance
export const aiGateway = new AIGateway();
