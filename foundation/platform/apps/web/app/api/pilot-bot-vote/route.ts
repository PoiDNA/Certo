import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Internal bot voting endpoint — NOT public.
 * Requires PILOT_BOT_SECRET. Bypasses IP rate limiting.
 * Adds votes to random accepted applications.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bot_secret, id, votes } = body;

    const expectedSecret = process.env.PILOT_BOT_SECRET;
    if (!expectedSecret || bot_secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: current } = await supabase
      .from('pilot_applications')
      .select('id, votes, organization_name')
      .eq('id', id)
      .eq('status', 'accepted')
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const addVotes = votes || 1;
    const { error } = await supabase
      .from('pilot_applications')
      .update({ votes: (current.votes || 0) + addVotes })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, name: current.organization_name, newTotal: (current.votes || 0) + addVotes });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
