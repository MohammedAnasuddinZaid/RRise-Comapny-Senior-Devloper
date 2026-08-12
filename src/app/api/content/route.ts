import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/env';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const type = searchParams.get('type');

    let query = supabase
      .from('content')
      .select('*')
      .eq('is_published', true);

    if (key) {
      query = query.eq('key', key);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If requesting a single key, return the content directly
    if (key && data && data.length > 0) {
      return NextResponse.json({
        content: data[0].content,
        metadata: data[0].metadata,
        title: data[0].title,
      });
    }

    return NextResponse.json({ content: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
