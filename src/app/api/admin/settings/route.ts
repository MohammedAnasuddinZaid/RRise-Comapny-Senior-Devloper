import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/api-auth';

const SENSITIVE_KEY_PATTERN = /secret|key|token|password|credential|private/i;

/**
 * Public GET returns settings for display (pricing page), but never exposes
 * sensitive values such as Stripe webhook secrets or API keys.
 */
export async function GET() {
  try {
    const { data: settings, error } = await getSupabaseAdmin()
      .from('system_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const safeSettings = (settings || []).filter((setting: any) => {
      const key = setting.key || '';
      return !SENSITIVE_KEY_PATTERN.test(key);
    });

    return NextResponse.json({ settings: safeSettings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { key, value, description } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('system_settings')
      .upsert({
        key,
        value: String(value),
        description,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, setting: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
