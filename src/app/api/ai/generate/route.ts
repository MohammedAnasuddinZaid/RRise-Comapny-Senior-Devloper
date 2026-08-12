import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/api-auth';
import { createServerComponentClient } from '@/lib/supabase-server';

// Default models per provider
const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  groq: 'llama3-8b-8192',
  openrouter: 'openai/gpt-4o-mini',
};

export async function POST(request: Request) {
  try {
    const { userId, userMessage, userPreferences, userGoals } = await request.json();

    if (!userMessage) {
      return NextResponse.json({ error: 'Missing required field (userMessage)' }, { status: 400 });
    }

    // Resolve the authenticated user (Bearer token first, then session cookies).
    let user = await getAuthUser(request);
    if (!user) {
      const supabase = await createServerComponentClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Never trust a client-provided userId; enforce the authenticated user.
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = getSupabaseAdmin();

    // Get user's active API keys from database
    const { data: apiKeys, error: keysError } = await admin
      .from('ai_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (keysError) {
      console.error('[AI API] Error fetching keys:', keysError);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json(
        {
          error: 'No active API keys found. Please add an API key in Settings.',
        },
        { status: 400 }
      );
    }

    // Use the newest active key
    const activeKey = apiKeys[0];
    const provider = activeKey.provider;
    const model = activeKey.selected_model || DEFAULT_MODELS[provider] || 'gemini-2.5-flash';
    const apiKey = activeKey.encrypted_key;

    console.log('[AI API] Using provider:', provider, 'model:', model, 'key length:', apiKey?.length);

    // Generate system prompt
    const systemPrompt = `You are Alex, a personal growth and productivity AI companion for RRise. 
Your role is to help users build better habits, stay productive, and achieve their goals.

User preferences: ${JSON.stringify(userPreferences || {})}
User goals: ${JSON.stringify(userGoals || [])}

When suggesting plans or routines, focus on:
- Habit building and consistency
- Productivity and time management
- Personal development and growth
- Fitness and wellness
- Study skills and learning

Keep responses concise, encouraging, and actionable. If you suggest a plan, describe it clearly with habits and tasks.`;

    // Call the appropriate provider API
    let response;
    if (provider === 'gemini') {
      response = await callGeminiAPI(apiKey, model, userMessage, systemPrompt);
    } else if (provider === 'openai') {
      response = await callOpenAIAPI(apiKey, model, userMessage, systemPrompt);
    } else if (provider === 'anthropic') {
      response = await callAnthropicAPI(apiKey, model, userMessage, systemPrompt);
    } else if (provider === 'groq') {
      response = await callGroqAPI(apiKey, model, userMessage, systemPrompt);
    } else if (provider === 'openrouter') {
      response = await callOpenRouterAPI(apiKey, model, userMessage, systemPrompt);
    } else {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    // Update usage stats
    await admin
      .from('ai_keys')
      .update({
        last_used: new Date().toISOString(),
        token_usage: (activeKey.token_usage || 0) + (response.tokensUsed || 0),
      })
      .eq('id', activeKey.id);

    return NextResponse.json({
      response: response.content,
      model: response.model,
      provider: response.provider,
    });
  } catch (error: any) {
    console.error('[AI API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function callGeminiAPI(apiKey: string, model: string, prompt: string, systemPrompt: string) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
      topP: 0.8,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini API] Error:', response.status, errorText);
    throw new Error(`Gemini API error (${response.status}): ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini returned no candidates');
  }

  const content = data.candidates[0].content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Gemini returned empty content');
  }

  return {
    content,
    model,
    provider: 'gemini',
    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
  };
}

async function callOpenAIAPI(apiKey: string, model: string, prompt: string, systemPrompt: string) {
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned no content');
  }

  return {
    content,
    model,
    provider: 'openai',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

async function callAnthropicAPI(apiKey: string, model: string, prompt: string, systemPrompt: string) {
  const messages = [{ role: 'user', content: prompt }];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      messages,
      system: systemPrompt,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('Anthropic returned no content');
  }

  return {
    content,
    model,
    provider: 'anthropic',
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
  };
}

async function callGroqAPI(apiKey: string, model: string, prompt: string, systemPrompt: string) {
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Groq returned no content');
  }

  return {
    content,
    model,
    provider: 'groq',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

async function callOpenRouterAPI(apiKey: string, model: string, prompt: string, systemPrompt: string) {
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenRouter returned no content');
  }

  return {
    content,
    model,
    provider: 'openrouter',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}
