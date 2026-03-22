import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Simple admin auth via secret header
function isAuthorized(request: Request): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) return true; // Allow if not configured (dev mode)
  const provided = request.headers.get('x-admin-key');
  return provided === adminKey;
}

// GET — list all applications (admin view)
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ data: [] });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('pilot_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[admin-applications] Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// PATCH — update application status
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'No database' }, { status: 500 });

  const body = await request.json();
  const { id, status, duplicate_of, ai_verified, ai_verification_notes, submission_count, rating_score } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (duplicate_of !== undefined) updates.duplicate_of = duplicate_of;
  if (ai_verified !== undefined) updates.ai_verified = ai_verified;
  if (ai_verification_notes !== undefined) updates.ai_verification_notes = ai_verification_notes;
  if (submission_count !== undefined) updates.submission_count = submission_count;
  if (rating_score !== undefined) updates.rating_score = rating_score;

  const { error } = await supabase
    .from('pilot_applications')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[admin-applications] Update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
