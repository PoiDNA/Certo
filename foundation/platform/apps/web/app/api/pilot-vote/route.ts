import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'No database' }, { status: 500 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Increment votes
  const { error } = await supabase.rpc('increment_votes', { row_id: id });

  if (error) {
    // Fallback: manual increment if RPC not available
    const { data: current } = await supabase
      .from('pilot_applications')
      .select('votes')
      .eq('id', id)
      .eq('status', 'accepted')
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Not found or not accepted' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('pilot_applications')
      .update({ votes: (current.votes || 0) + 1 })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
