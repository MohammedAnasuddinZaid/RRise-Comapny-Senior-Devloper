import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const userId = searchParams.get('userId');

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    // Verify admin authentication first
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAuth
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let exportText = '';

    if (type === 'chat' || type === 'all') {
      exportText += await exportChatHistory(supabase, userId);
    }

    if (type === 'user' || type === 'all') {
      exportText += await exportUserData(supabase, userId);
    }

    // Return as downloadable text file
    return new NextResponse(exportText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="rrise-export-${type}-${new Date().toISOString().split('T')[0]}.txt"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function exportChatHistory(supabase: any, userId?: string | null) {
  let text = '=== CHAT HISTORY EXPORT ===\n';
  text += `Export Date: ${new Date().toISOString()}\n\n`;

  try {
    let conversationsQuery = supabase
      .from('chat_conversations')
      .select('*, profiles!inner(email, name)')
      .order('updated_at', { ascending: false });

    if (userId) {
      conversationsQuery = conversationsQuery.eq('user_id', userId);
    }

    const { data: conversations, error } = await conversationsQuery;

    if (error) {
      text += `Error loading conversations: ${error.message}\n`;
      return text;
    }

    if (!conversations || conversations.length === 0) {
      text += 'No conversations found.\n';
      return text;
    }

    for (const conversation of conversations) {
      const userEmail = conversation.profiles?.email || 'Unknown';
      const userName = conversation.profiles?.name || '';
      
      text += `\n--- Conversation ---\n`;
      text += `ID: ${conversation.id}\n`;
      text += `User: ${userEmail} ${userName ? `(${userName})` : ''}\n`;
      text += `Title: ${conversation.title || 'Untitled'}\n`;
      text += `Created: ${conversation.created_at ? new Date(conversation.created_at).toLocaleString() : 'N/A'}\n`;
      text += `Updated: ${conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : 'N/A'}\n`;

      // Get messages for this conversation
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        text += `\nError loading messages: ${msgError.message}\n`;
        continue;
      }

      if (messages && messages.length > 0) {
        text += `\nMessages:\n`;
        for (const msg of messages) {
          const role = msg.role === 'user' ? 'USER' : 'ASSISTANT';
          const timestamp = msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A';
          const content = msg.content || '';
          text += `[${timestamp}] ${role}:\n${content}\n\n`;
        }
      } else {
        text += 'No messages in this conversation.\n';
      }
    }
  } catch (error: any) {
    text += `Unexpected error: ${error.message}\n`;
  }

  text += '\n=== END CHAT HISTORY ===\n\n';
  return text;
}

async function exportUserData(supabase: any, userId?: string | null) {
  let text = '=== USER DATA EXPORT ===\n';
  text += `Export Date: ${new Date().toISOString()}\n\n`;

  try {
    let profilesQuery = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      profilesQuery = profilesQuery.eq('id', userId);
    }

    const { data: profiles, error } = await profilesQuery;

    if (error) {
      text += `Error loading profiles: ${error.message}\n`;
      return text;
    }

    if (!profiles || profiles.length === 0) {
      text += 'No users found.\n';
      return text;
    }

    for (const profile of profiles) {
      text += `\n--- USER ---\n`;
      text += `Email: ${profile.email || 'N/A'}\n`;
      text += `Name: ${profile.name || 'N/A'}\n`;
      text += `Plan: ${profile.plan || 'free'}\n`;
      text += `Created: ${profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}\n`;
      text += `Total XP: ${profile.xp_total || 0}\n`;
      text += `Streak Count: ${profile.streak_count || 0}\n`;
      text += `Token Limit: ${profile.token_limit || 'Unlimited'}\n`;

      // Export goals
      try {
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', profile.id);
        
        if (!goalsError && goals && goals.length > 0) {
          text += `\nGoals (${goals.length}):\n`;
          for (const goal of goals) {
            text += `  - ${goal.title || 'Untitled'} | Progress: ${goal.progress || 0}% | Status: ${goal.status || 'unknown'}\n`;
          }
        }
      } catch (e) {
        text += `\nError loading goals\n`;
      }

      // Export habits
      try {
        const { data: habits, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', profile.id);
        
        if (!habitsError && habits && habits.length > 0) {
          text += `\nHabits (${habits.length}):\n`;
          for (const habit of habits) {
            text += `  - ${habit.title || 'Untitled'} | Frequency: ${habit.frequency || 'unknown'} | XP: ${habit.xp_reward || 0}\n`;
          }
        }
      } catch (e) {
        text += `\nError loading habits\n`;
      }

      // Export tasks
      try {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', profile.id);
        
        if (!tasksError && tasks && tasks.length > 0) {
          text += `\nTasks (${tasks.length}):\n`;
          for (const task of tasks) {
            text += `  - ${task.title || 'Untitled'} | Priority: ${task.priority || 'medium'} | Status: ${task.status || 'unknown'}\n`;
          }
        }
      } catch (e) {
        text += `\nError loading tasks\n`;
      }

      // Export journal entries
      try {
        const { data: journals, error: journalsError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (!journalsError && journals && journals.length > 0) {
          text += `\nRecent Journal Entries (${journals.length}):\n`;
          for (const journal of journals) {
            const dateStr = journal.created_at ? new Date(journal.created_at).toLocaleDateString() : 'N/A';
            text += `  - ${journal.title || 'No title'} | Mood: ${journal.mood || 'N/A'} | ${dateStr}\n`;
          }
        }
      } catch (e) {
        text += `\nError loading journal entries\n`;
      }
    }
  } catch (error: any) {
    text += `Unexpected error: ${error.message}\n`;
  }

  text += '\n=== END USER DATA ===\n\n';
  return text;
}
