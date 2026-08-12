import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin, getAuthUser } from '@/lib/api-auth';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const key = searchParams.get('key');

  let query = getSupabaseAdmin().from('content').select('*').order('updated_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  if (key) {
    query = query.eq('key', key);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ content: data });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const user = await getAuthUser(request);

  try {
    const { key, type, title, content, metadata, is_published } = await request.json();

    if (!key || !type || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('content')
      .insert({
        key,
        type,
        title,
        content,
        metadata: metadata || {},
        is_published: is_published !== undefined ? is_published : true,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { id, key, type, title, content, metadata, is_published } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (key !== undefined) updates.key = key;
    if (type !== undefined) updates.type = type;
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (metadata !== undefined) updates.metadata = metadata;
    if (is_published !== undefined) updates.is_published = is_published;

    const { data, error } = await getSupabaseAdmin()
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from('content').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
