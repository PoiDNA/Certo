import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// In-memory rate limit store (per-instance, resets on deploy)
const votedIPs = new Map<string, Set<string>>();

async function getClientIP(): Promise<string> {
  const h = await headers();
  // Cloudflare
  const cfIP = h.get('cf-connecting-ip');
  if (cfIP) return cfIP;
  // Vercel / standard proxies
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = h.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

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

  // IP-based duplicate vote prevention
  const ip = await getClientIP();
  if (!votedIPs.has(ip)) votedIPs.set(ip, new Set());
  const ipVotes = votedIPs.get(ip)!;

  if (ipVotes.has(id)) {
    return NextResponse.json({ error: 'Already voted' }, { status: 429 });
  }

  // Max 10 votes per IP total (anti-bot)
  if (ipVotes.size >= 10) {
    return NextResponse.json({ error: 'Vote limit reached' }, { status: 429 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Verify application exists and is accepted
  const { data: current } = await supabase
    .from('pilot_applications')
    .select('votes')
    .eq('id', id)
    .eq('status', 'accepted')
    .single() as { data: { votes: number } | null };

  if (!current) {
    return NextResponse.json({ error: 'Not found or not accepted' }, { status: 404 });
  }

  const { error } = await supabase
    .from('pilot_applications')
    .update({ votes: (current.votes || 0) + 1 })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
  }

  // Record vote for this IP
  ipVotes.add(id);

  return NextResponse.json({ ok: true });
}
