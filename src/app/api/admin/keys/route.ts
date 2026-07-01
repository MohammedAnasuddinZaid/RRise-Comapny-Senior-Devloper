import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Default model fallbacks per provider
const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  groq: 'llama3-8b-8192',
  openrouter: 'openai/gpt-4o-mini',
};

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return false;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin === true;
}

export async function POST(request: Request) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, provider, keyName, key, model } = await request.json();

    if (!userId || !provider || !keyName || !key) {
      return NextResponse.json({ error: 'Missing required fields (userId, provider, keyName, key)' }, { status: 400 });
    }

    const resolvedModel = model || DEFAULT_MODELS[provider] || 'gemini-2.5-flash';

    // Deactivate all existing active keys for this user+provider
    await supabaseAdmin
      .from('ai_keys')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true);

    // Insert the new key with selected_model
    const { error } = await supabaseAdmin
      .from('ai_keys')
      .insert({
        user_id: userId,
        provider,
        key_name: keyName,
        encrypted_key: key,
        selected_model: resolvedModel,
        is_active: true,
        token_usage: 0,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, provider, model: resolvedModel });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
