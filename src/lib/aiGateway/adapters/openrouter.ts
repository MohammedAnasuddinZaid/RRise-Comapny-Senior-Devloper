/**
 * OpenRouter Adapter
 * 
 * Implementation of AIProvider for OpenRouter API
 */

import type { AIProvider, AIModel, ConnectionTestResult, GenerationResult, GenerationOptions } from '../types';

export class OpenRouterAdapter implements AIProvider {
  readonly type = 'openrouter' as const;
  readonly name = 'OpenRouter';
  readonly baseUrl = 'https://openrouter.ai/api/v1';

  async fetchModels(apiKey: string): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data.data || []).map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        contextWindow: model.context_length,
        maxTokens: model.max_tokens,
        inputPrice: model.pricing?.prompt,
        outputPrice: model.pricing?.completion,
      }));
    } catch (error) {
      console.error('[OpenRouter Adapter] Error fetching models:', error);
      return this.getFallbackModels();
    }
  }

  async testConnection(apiKey: string, model: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          provider: this.type,
          model,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: error,
        };
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return {
          success: true,
          provider: this.type,
          model,
          responseTime,
        };
      }

      return {
        success: false,
        provider: this.type,
        model,
        responseTime,
        error: 'No choices returned',
        details: data,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        provider: this.type,
        model,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateResponse(
    apiKey: string,
    model: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<GenerationResult> {
    console.log('[OpenRouter Adapter] Generating response with model:', model);

    const messages: any[] = [];
    
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenRouter returned no choices');
    }

    const choice = data.choices[0];
    const content = choice.message?.content;

    if (!content) {
      throw new Error('OpenRouter returned empty content');
    }

    return {
      content,
      model,
      provider: this.type,
      finishReason: choice.finish_reason?.toLowerCase() as any || 'stop',
      tokensUsed: data.usage?.total_tokens,
    };
  }

  private getFallbackModels(): AIModel[] {
    return [
      {
        id: 'anthropic/claude-sonnet-4',
        name: 'Claude Sonnet 4 (via OpenRouter)',
        description: 'Claude Sonnet 4 through OpenRouter',
      },
      {
        id: 'openai/gpt-5',
        name: 'GPT-5 (via OpenRouter)',
        description: 'GPT-5 through OpenRouter',
      },
    ];
  }
}
