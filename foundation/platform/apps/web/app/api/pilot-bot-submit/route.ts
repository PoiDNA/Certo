import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Internal bot endpoint — NOT public.
 * Requires PILOT_BOT_SECRET to authenticate.
 * Bypasses Turnstile (bot is trusted), but still checks for duplicates.
 * Does NOT appear in any frontend code or public API docs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bot_secret, organization_name, sector, city, country, applicant_type, contact_person, email, motivation, relation, consent } = body;

    // ─── Auth: require bot secret ────────────────────────────
    const expectedSecret = process.env.PILOT_BOT_SECRET;
    if (!expectedSecret) {
      return NextResponse.json({ error: 'Bot endpoint not configured' }, { status: 503 });
    }
    if (bot_secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── Validation ──────────────────────────────────────────
    if (!organization_name || !sector || !city || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ─── Duplicate check ─────────────────────────────────────
    const { data: existing } = await supabase
      .from('pilot_applications')
      .select('id')
      .ilike('organization_name', organization_name)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Duplicate — already exists', id: existing[0].id }, { status: 409 });
    }

    // ─── Insert — auto-accepted with process_status ──────────
    const insertPayload: Record<string, unknown> = {
      applicant_type: applicant_type || 'observer',
      organization_name,
      sector,
      city,
      country,
      contact_person: contact_person || 'Certo Bot',
      email: email || 'bot@certogov.org',
      motivation: motivation || 'Public entity from verified registry',
      relation: relation || 'automated',
      consent: consent ?? true,
      status: 'accepted',
      process_status: 'zgloszenie',
      ai_verified: true,
      ai_verification_notes: '🤖 Bot submission — entity from verified public registry database',
      votes: 0,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('pilot_applications')
      .insert(insertPayload)
      .select('id')
      .single();

    if (insertError) {
      console.error('[pilot-bot-submit] Insert error:', insertError);
      return NextResponse.json({ error: 'Insert failed', detail: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: inserted.id });

  } catch (err) {
    console.error('[pilot-bot-submit] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
