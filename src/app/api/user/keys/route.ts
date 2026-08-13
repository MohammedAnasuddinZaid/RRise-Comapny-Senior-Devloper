import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/api-auth';
import { encryptSecret } from '@/lib/keyCrypto';

// Default models per provider (fallback if API fetch fails)
const DEFAULT_MODELS: Record<string, { id: string; name: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Recommended)' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Recommended)' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  ],
  groq: [
    { id: 'llama3-8b-8192', name: 'Llama 3 8B (Recommended)' },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  ],
  openrouter: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini via OpenRouter' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash via OpenRouter' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku via OpenRouter' },
  ],
};

const PROVIDERS = ['openai', 'gemini', 'anthropic', 'groq', 'openrouter'];

/**
 * GET /api/user/keys
 * Get all active API key configs for the authenticated user (encrypted_key excluded).
 */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('ai_keys')
      .select('id, user_id, provider, key_name, selected_model, is_active, token_usage, last_used, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ keys: data || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

/**
 * POST /api/user/keys
 * Save a new API key for the authenticated user.
 * Body: { provider, model, apiKey, keyName? }
 */
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { provider, model, apiKey, keyName } = await request.json();

    if (!provider || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields (provider, model, apiKey)' }, { status: 400 });
    }

    if (!PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    const trimmedKey = apiKey.trim();
    if (!trimmedKey || trimmedKey.length < 10) {
      return NextResponse.json({ error: 'API key appears invalid (too short)' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Deactivate existing keys for this provider
    await admin
      .from('ai_keys')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('is_active', true);

    // Insert new key (encrypted at rest)
    const { data, error } = await admin
      .from('ai_keys')
      .insert({
        user_id: user.id,
        provider,
        selected_model: model,
        key_name: keyName || `${provider} Key`,
        encrypted_key: encryptSecret(trimmedKey),
        is_active: true,
        token_usage: 0,
      })
      .select('id, provider, key_name, selected_model, is_active, token_usage, created_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, key: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
  }
}

/**
 * DELETE /api/user/keys
 * Delete an API key for the authenticated user.
 * Body: { keyId } or { provider }
 */
export async function DELETE(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { keyId, provider } = await request.json();

    if (!keyId && !provider) {
      return NextResponse.json({ error: 'Missing keyId or provider' }, { status: 400 });
    }

    let query = getSupabaseAdmin().from('ai_keys').delete().eq('user_id', user.id);

    if (keyId) {
      query = query.eq('id', keyId);
    } else if (provider) {
      query = query.eq('provider', provider);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
  }
}

/**
 * PATCH /api/user/keys
 * Test connection or fetch models (server-side to avoid CORS issues).
 * Body: { action: 'test' | 'models', provider, apiKey, model? }
 */
export async function PATCH(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action, provider, apiKey, model } = await request.json();

    if (!action || !provider || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const trimmedKey = apiKey.trim();

    if (action === 'models') {
      const models = DEFAULT_MODELS[provider] || [];
      return NextResponse.json({ models });
    }

    if (action === 'test') {
      const testModel = model || DEFAULT_MODELS[provider]?.[0]?.id;
      const result = await testAPIKey(provider, trimmedKey, testModel);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
  }
}

/**
 * Test an API key by making a minimal request to the provider.
 */
async function testAPIKey(provider: string, apiKey: string, model: string) {
  try {
    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      if (res.ok) return { success: true, message: 'Gemini connection successful' };
      const err = await res.text();
      return { success: false, error: `Gemini error (${res.status}): ${err.substring(0, 200)}` };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      if (res.ok) return { success: true, message: 'OpenAI connection successful' };
      const err = await res.text();
      return { success: false, error: `OpenAI error (${res.status}): ${err.substring(0, 200)}` };
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      if (res.ok) return { success: true, message: 'Anthropic connection successful' };
      const err = await res.text();
      return { success: false, error: `Anthropic error (${res.status}): ${err.substring(0, 200)}` };
    }

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'llama3-8b-8192',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      if (res.ok) return { success: true, message: 'Groq connection successful' };
      const err = await res.text();
      return { success: false, error: `Groq error (${res.status}): ${err.substring(0, 200)}` };
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      if (res.ok) return { success: true, message: 'OpenRouter connection successful' };
      const err = await res.text();
      return { success: false, error: `OpenRouter error (${res.status}): ${err.substring(0, 200)}` };
    }

    return { success: false, error: `Unsupported provider: ${provider}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
