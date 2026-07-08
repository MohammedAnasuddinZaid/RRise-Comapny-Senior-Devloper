/**
 * Anthropic Adapter
 * 
 * Implementation of AIProvider for Anthropic Claude API
 */

import type { AIProvider, AIModel, ConnectionTestResult, GenerationResult, GenerationOptions } from '../types';

export class AnthropicAdapter implements AIProvider {
  readonly type = 'anthropic' as const;
  readonly name = 'Anthropic';
  readonly baseUrl = 'https://api.anthropic.com/v1';

  async fetchModels(apiKey: string): Promise<AIModel[]> {
    // Anthropic doesn't have a public models endpoint
    // Return known models
    return this.getFallbackModels();
  }

  async testConnection(apiKey: string, model: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
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
      
      if (data.content && data.content.length > 0) {
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
        error: 'No content returned',
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
    console.log('[Anthropic Adapter] Generating response with model:', model);

    const messages: any[] = [{ role: 'user', content: prompt }];
    
    if (options?.systemPrompt) {
      messages.unshift({ role: 'user', content: options.systemPrompt });
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens || 500,
        messages,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Anthropic API error (${response.status}): ${response.statusText}`;
      
      // Provide specific guidance for common errors
      if (response.status === 403) {
        errorMessage += '\n\nYour API key does not have access to this model or your account has restrictions. Please check your Anthropic account settings.\n\n[Troubleshooting Guide](/app/troubleshoot)';
      } else if (response.status === 401) {
        errorMessage += '\n\nYour API key is invalid. Please check your API key in Settings.\n\n[Troubleshooting Guide](/app/troubleshoot)';
      } else if (response.status === 429) {
        errorMessage += '\n\nYou have exceeded your rate limit. Please try again later or upgrade your plan.\n\n[Troubleshooting Guide](/app/troubleshoot)';
      }
      
      throw new Error(errorMessage + (errorText ? `\n\nDetails: ${errorText}` : ''));
    }

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      throw new Error('Anthropic returned no content');
    }

    const content = data.content[0].text;

    if (!content) {
      throw new Error('Anthropic returned empty content');
    }

    return {
      content,
      model,
      provider: this.type,
      finishReason: data.stop_reason?.toLowerCase() as any || 'stop',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  }

  private getFallbackModels(): AIModel[] {
    return [
      {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        description: 'Balanced model for most tasks',
      },
      {
        id: 'claude-opus-4',
        name: 'Claude Opus 4',
        description: 'Most capable model for complex tasks',
      },
    ];
  }
}
