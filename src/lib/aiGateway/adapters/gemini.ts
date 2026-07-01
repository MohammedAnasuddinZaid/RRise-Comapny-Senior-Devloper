/**
 * Gemini Adapter
 * 
 * Implementation of AIProvider for Google Gemini API
 */

import type { AIProvider, AIModel, ConnectionTestResult, GenerationResult, GenerationOptions } from '../types';

export class GeminiAdapter implements AIProvider {
  readonly type = 'gemini' as const;
  readonly name = 'Google Gemini';
  readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async fetchModels(apiKey: string): Promise<AIModel[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${apiKey}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data.models || [])
        .filter((model: any) => model.name.includes('gemini'))
        .map((model: any) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name,
          description: model.description,
          contextWindow: model.contextWindow,
          maxTokens: model.maxOutputTokens,
        }));
    } catch (error) {
      console.error('[Gemini Adapter] Error fetching models:', error);
      // Return fallback models if API call fails
      return this.getFallbackModels();
    }
  }

  async testConnection(apiKey: string, model: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );

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
      
      if (data.candidates && data.candidates.length > 0) {
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
        error: 'No candidates returned',
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
    console.log('[Gemini Adapter] Generating response with model:', model);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: options?.systemPrompt 
                ? `${options.systemPrompt}\n\nUser: ${prompt}`
                : prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        topP: options?.topP || 0.8,
      },
    };

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();

    // Check for safety filter or blocked response
    if (!data.candidates || data.candidates.length === 0) {
      const errorReason = data.promptFeedback?.blockReason || 'No candidates returned';
      throw new Error(`Gemini blocked the response: ${errorReason}`);
    }

    const candidate = data.candidates[0];
    
    // Check if the candidate was blocked
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Gemini blocked this response due to safety guidelines. Please try rephrasing your request.');
    }

    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('Gemini returned an invalid response structure');
    }

    const content = candidate.content.parts[0].text;
    
    if (!content) {
      throw new Error('Gemini returned an empty response');
    }

    return {
      content,
      model,
      provider: this.type,
      finishReason: candidate.finishReason?.toLowerCase() as any || 'stop',
    };
  }

  private getFallbackModels(): AIModel[] {
    return [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast and efficient model for most tasks',
      },
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'Lightweight version of Flash',
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Most capable model for complex tasks',
      },
    ];
  }
}
