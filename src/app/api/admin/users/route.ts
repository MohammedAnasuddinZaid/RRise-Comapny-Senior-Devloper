import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const admin = getSupabaseAdmin();

  // Fetch all users with profile data
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, name, email, plan, token_limit, is_admin, created_at, stripe_customer_id, xp_total, streak_count')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch API keys and usage for each user
  const usersWithDetails = await Promise.all(
    profiles.map(async (profile: any) => {
      const { data: apiKeys } = await admin
        .from('ai_keys')
        .select('*')
        .eq('user_id', profile.id);

      const { data: usageLogs } = await admin
        .from('ai_usage_logs')
        .select('tokens_used')
        .eq('user_id', profile.id);

      const totalTokensUsed =
        usageLogs?.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0) || 0;

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
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { userId, plan, token_limit } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (plan !== undefined) updates.plan = plan;
    if (token_limit !== undefined) updates.token_limit = token_limit;

    console.log('Updating user:', userId, 'with updates:', updates);

    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Database error updating user:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log('Update successful:', data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH handler:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Deleting user and all data:', userId);

    // Delete all user data in correct order (respecting foreign keys)
    const tablesToDelete = [
      'subscriptions',
      'payments',
      'billing_history',
      'chat_messages',
      'chat_conversations',
      'api_keys',
      'ai_keys',
      'ai_usage_logs',
      'habit_logs',
      'task_logs',
      'spending_entries',
      'xp_logs',
      'safety_events',
      'habits',
      'tasks',
      'goals',
      'journal_entries',
      'moods',
      'streaks',
      'weekly_recaps',
      'mascot_state',
      'prompt_memory',
      'app_settings',
      'profiles',
    ];

    const errors: string[] = [];
    for (const table of tablesToDelete) {
      const { error } = await getSupabaseAdmin()
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        errors.push(`${table}: ${error.message}`);
      }
    }

    // Delete auth user
    const { error: authError } = await getSupabaseAdmin().auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting auth user:', authError);
      errors.push(`auth: ${authError.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Partial deletion completed with errors',
          details: errors,
        },
        { status: 207 }
      );
    }

    console.log('User deletion successful');
    return NextResponse.json({ success: true, message: 'User and all data deleted successfully' });
  } catch (err: any) {
    console.error('Error in DELETE handler:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
