/**
 * AI Gateway Types
 * 
 * Core types and interfaces for the provider-agnostic AI system
 */

export type AIProviderType = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter';

export interface AIProvider {
  /**
   * Provider identifier
   */
  readonly type: AIProviderType;
  
  /**
   * Provider display name
   */
  readonly name: string;
  
  /**
   * Base URL for API requests
   */
  readonly baseUrl: string;
  
  /**
   * Fetch available models from the provider
   */
  fetchModels(apiKey: string): Promise<AIModel[]>;
  
  /**
   * Test connection to the provider
   */
  testConnection(apiKey: string, model: string): Promise<ConnectionTestResult>;
  
  /**
   * Generate a response from the AI
   */
  generateResponse(
    apiKey: string,
    model: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<GenerationResult>;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  maxTokens?: number;
  inputPrice?: number; // per 1M tokens
  outputPrice?: number; // per 1M tokens
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface GenerationResult {
  content: string;
  tokensUsed?: number;
  model: string;
  provider: AIProviderType;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface ConnectionTestResult {
  success: boolean;
  provider: AIProviderType;
  model: string;
  responseTime?: number;
  error?: string;
  details?: any;
}

export interface AIConfig {
  provider: AIProviderType;
  model: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
  tokenUsage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfig {
  enabled: boolean;
  availablePlans: ('free' | 'pro' | 'ultra')[];
  defaultModel?: string;
  requiresApiKey: boolean;
}
