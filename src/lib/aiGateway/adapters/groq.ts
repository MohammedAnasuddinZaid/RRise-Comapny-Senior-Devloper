/**
 * Groq Adapter
 * 
 * Implementation of AIProvider for Groq API
 */

import type { AIProvider, AIModel, ConnectionTestResult, GenerationResult, GenerationOptions } from '../types';

export class GroqAdapter implements AIProvider {
  readonly type = 'groq' as const;
  readonly name = 'Groq';
  readonly baseUrl = 'https://api.groq.com/openai/v1';

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
        name: model.id,
        description: model.description,
        contextWindow: model.context_window,
        maxTokens: model.max_tokens,
      }));
    } catch (error) {
      console.error('[Groq Adapter] Error fetching models:', error);
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
    console.log('[Groq Adapter] Generating response with model:', model);

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
      let errorMessage = `Groq API error (${response.status}): ${response.statusText}`;
      
      // Provide specific guidance for common errors
      if (response.status === 403) {
        errorMessage += '\n\nYour API key does not have access to this model or your account has restrictions. Please check your Groq account settings.\n\n[Troubleshooting Guide](/app/troubleshoot)';
      } else if (response.status === 401) {
        errorMessage += '\n\nYour API key is invalid. Please check your API key in Settings.\n\n[Troubleshooting Guide](/app/troubleshoot)';
      } else if (response.status === 429) {
        errorMessage += '\n\nYou have exceeded your rate limit. Please try again later.\n\n[Troubleshooting Guide](/app/troubleshoot)';
      }
      
      throw new Error(errorMessage + (errorText ? `\n\nDetails: ${errorText}` : ''));
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Groq returned no choices');
    }

    const choice = data.choices[0];
    const content = choice.message?.content;

    if (!content) {
      throw new Error('Groq returned empty content');
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
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        description: 'Versatile model for various tasks',
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Mixture of experts model',
      },
    ];
  }
}
