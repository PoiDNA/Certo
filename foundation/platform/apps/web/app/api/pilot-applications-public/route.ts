import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ data: [], count: 0 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Try with rating_score first, fallback without if column doesn't exist yet
  let data;
  let error;

  ({ data, error } = await supabase
    .from('pilot_applications')
    .select('id, organization_name, sector, city, country, created_at, votes, status, rating_score')
    .neq('status', 'rejected')
    .order('created_at', { ascending: false }));

  if (error) {
    // Fallback: column rating_score may not exist yet
    console.warn('[pilot-applications-public] Trying without rating_score:', error.message);
    ({ data, error } = await supabase
      .from('pilot_applications')
      .select('id, organization_name, sector, city, country, created_at, votes, status')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false }));
  }

  if (error) {
    console.error('[pilot-applications-public] Supabase error:', error);
    return NextResponse.json({ data: [], count: 0 });
  }

  return NextResponse.json({
    data: data || [],
    count: data?.length || 0,
  });
}
