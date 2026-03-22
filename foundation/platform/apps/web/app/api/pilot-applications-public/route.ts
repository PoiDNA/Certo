import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ data: [], count: 0 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('pilot_applications')
    .select('organization_name, sector, city, country, created_at')
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[pilot-applications-public] Supabase error:', error);
    return NextResponse.json({ data: [], count: 0 });
  }

  return NextResponse.json({
    data: data || [],
    count: data?.length || 0,
  });
}
