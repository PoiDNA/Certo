import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Try with all columns first
  let { data, error } = await supabase
    .from('pilot_applications')
    .select('id, organization_name, sector, city, country, created_at, votes, status, process_status, rating_score, nip')
    .eq('id', id)
    .neq('status', 'rejected')
    .single();

  if (error) {
    // Fallback without newer columns
    ({ data, error } = await supabase
      .from('pilot_applications')
      .select('id, organization_name, sector, city, country, created_at, votes, status, nip')
      .eq('id', id)
      .neq('status', 'rejected')
      .single());
  }

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
