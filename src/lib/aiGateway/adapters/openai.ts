/**
 * OpenAI Adapter
 * 
 * Implementation of AIProvider for OpenAI API
 */

import type { AIProvider, AIModel, ConnectionTestResult, GenerationResult, GenerationOptions } from '../types';

export class OpenAIAdapter implements AIProvider {
  readonly type = 'openai' as const;
  readonly name = 'OpenAI';
  readonly baseUrl = 'https://api.openai.com/v1';

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
      
      return (data.data || [])
        .filter((model: any) => model.id.startsWith('gpt'))
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          description: model.description,
          contextWindow: model.context_window,
          maxTokens: model.max_tokens,
        }));
    } catch (error) {
      console.error('[OpenAI Adapter] Error fetching models:', error);
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
    console.log('[OpenAI Adapter] Generating response with model:', model);

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
      throw new Error(`OpenAI API error (${response.status}): ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI returned no choices');
    }

    const choice = data.choices[0];
    const content = choice.message?.content;

    if (!content) {
      throw new Error('OpenAI returned empty content');
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
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Most capable model for complex tasks',
      },
      {
        id: 'gpt-5-mini',
        name: 'GPT-5 Mini',
        description: 'Smaller, faster model for most tasks',
      },
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        description: 'Advanced model for complex reasoning',
      },
    ];
  }
}
