import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Base columns that definitely exist
  const baseCols = 'id, organization_name, sector, city, country, created_at, votes, status, applicant_type';

  // Try with all columns, cascade fallback
  const attempts = [
    `${baseCols}, process_status, rating_score, nip`,
    `${baseCols}, process_status, rating_score`,
    `${baseCols}, nip`,
    baseCols,
  ];

  let data = null;
  for (const cols of attempts) {
    const result = await supabase
      .from('pilot_applications')
      .select(cols)
      .eq('id', id)
      .neq('status', 'rejected')
      .single();

    if (!result.error && result.data) {
      data = result.data;
      break;
    }
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
