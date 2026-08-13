import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/api-auth';
import { encryptSecret } from '@/lib/keyCrypto';

// Default model fallbacks per provider
const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  groq: 'llama3-8b-8192',
  openrouter: 'openai/gpt-4o-mini',
};

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { userId, provider, keyName, key, keyData, model } = await request.json();

    // Decode from base64 if keyData is provided to bypass WAF, otherwise fallback to key
    const actualKey = keyData ? Buffer.from(keyData, 'base64').toString('utf-8') : key;

    if (!userId || !provider || !keyName || !actualKey) {
      return NextResponse.json(
        { error: 'Missing required fields (userId, provider, keyName, key/keyData)' },
        { status: 400 }
      );
    }

    const resolvedModel = model || DEFAULT_MODELS[provider] || 'gemini-2.5-flash';

    const admin = getSupabaseAdmin();

    // Deactivate all existing active keys for this user+provider
    await admin
      .from('ai_keys')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true);

    // Insert the new key with selected_model (encrypted at rest)
    const { error } = await admin
      .from('ai_keys')
      .insert({
        user_id: userId,
        provider,
        key_name: keyName,
        encrypted_key: encryptSecret(actualKey),
        selected_model: resolvedModel,
        is_active: true,
        token_usage: 0,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, provider, model: resolvedModel });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { keyId } = await request.json();

    if (!keyId) {
      return NextResponse.json({ error: 'Missing required field (keyId)' }, { status: 400 });
    }

    // Delete the key from ai_keys table
    const { error } = await getSupabaseAdmin().from('ai_keys').delete().eq('id', keyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 400 });
  }
}
