import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip if not configured

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = await res.json();
  return data.success === true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { applicant_type, organization_name, city, country, address, postal_code, nip, krs, regon, website, sector, contact_person, role, email, phone, motivation, relation, consent, turnstile_token } = body;

    // Turnstile verification
    if (turnstile_token) {
      const valid = await verifyTurnstile(turnstile_token);
      if (!valid) {
        return NextResponse.json({ error: 'Bot verification failed' }, { status: 403 });
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      console.warn('[pilot-application] Missing Turnstile token — allowing submission with warning');
      // Don't block — widget may not have loaded in multi-step form
    }

    // Validation
    if (!organization_name || !sector || !contact_person || !email || !motivation || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['publiczny', 'prywatny', 'pozarzadowy'].includes(sector)) {
      return NextResponse.json({ error: 'Invalid sector' }, { status: 400 });
    }

    if (!['representative', 'observer'].includes(applicant_type)) {
      return NextResponse.json({ error: 'Invalid applicant type' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('[pilot-application] No Supabase config — logging application:', {
        applicant_type,
        organization_name,
        city,
        country,
        address,
        postal_code,
        nip,
        krs,
        regon,
        website,
        sector,
        contact_person,
        role,
        email,
        phone,
        motivation,
        relation,
        created_at: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, fallback: true });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('pilot_applications').insert({
      applicant_type,
      organization_name,
      city: city || null,
      country: country || 'PL',
      address: address || null,
      postal_code: postal_code || null,
      nip: nip || null,
      krs: krs || null,
      regon: regon || null,
      website: website || null,
      sector,
      contact_person,
      role: role || null,
      email,
      phone: phone || null,
      motivation,
      relation: relation || null,
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
