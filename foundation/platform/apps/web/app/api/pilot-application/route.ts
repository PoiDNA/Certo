import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { organization_name, sector, contact_person, email, phone, motivation, consent } = body;

    // Validation
    if (!organization_name || !sector || !contact_person || !email || !motivation || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['publiczny', 'korporacyjny', 'pozarzadowy'].includes(sector)) {
      return NextResponse.json({ error: 'Invalid sector' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      // Fallback: log to console if Supabase not configured
      console.log('[pilot-application] No Supabase config — logging application:', {
        organization_name,
        sector,
        contact_person,
        email,
        phone,
        motivation,
        created_at: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, fallback: true });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('pilot_applications').insert({
      organization_name,
      sector,
      contact_person,
      email,
      phone: phone || null,
      motivation,
      consent,
    });

    if (error) {
      console.error('[pilot-application] Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[pilot-application] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
