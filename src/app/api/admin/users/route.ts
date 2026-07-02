import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@/lib/supabase'; // Actually we should use server client but service role bypasses anyway

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// We should ideally verify the requesting user is an admin.
async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return false;

  // Check if user is admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin === true;
}

export async function GET(request: Request) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all users with profile data
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, plan, token_limit, is_admin, created_at, stripe_customer_id, xp_total, streak_count')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch API keys and usage for each user
  const usersWithDetails = await Promise.all(
    profiles.map(async (profile: any) => {
      // Get API keys
      const { data: apiKeys } = await supabaseAdmin
        .from('api_keys')
        .select('*')
        .eq('user_id', profile.id);

      // Get usage stats
      const { data: usageLogs } = await supabaseAdmin
        .from('ai_usage_logs')
        .select('tokens_used')
        .eq('user_id', profile.id);

      const totalTokensUsed = usageLogs?.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0) || 0;

      return {
        ...profile,
        api_keys: apiKeys || [],
        total_tokens_used: totalTokensUsed,
        tokens_remaining: (profile.token_limit || 0) - totalTokensUsed,
      };
    })
  );

  return NextResponse.json({ users: usersWithDetails });
}

export async function PATCH(request: Request) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, plan, token_limit } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (plan !== undefined) updates.plan = plan;
    if (token_limit !== undefined) updates.token_limit = token_limit;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
