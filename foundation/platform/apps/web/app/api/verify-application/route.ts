import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────
interface VerificationResult {
  exists: boolean;
  confidence: 'high' | 'medium' | 'low' | 'none';
  notes: string[];
  checks: {
    vies?: { valid: boolean; name?: string; address?: string };
    website?: { reachable: boolean; status?: number };
    duplicate?: { isDuplicate: boolean; originalId?: string; originalName?: string };
  };
}

interface Application {
  id: string;
  organization_name: string;
  nip: string | null;
  krs: string | null;
  regon: string | null;
  website: string | null;
  country: string;
  city: string | null;
  sector: string;
  email: string;
}

// ─── VIES VAT Validation (EU-wide, free, official) ──────
async function checkVIES(vatNumber: string, countryCode: string): Promise<{ valid: boolean; name?: string; address?: string }> {
  try {
    // Clean VAT number — remove country prefix if present, spaces, dashes
    let cleanVat = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
    if (cleanVat.startsWith(countryCode)) {
      cleanVat = cleanVat.slice(countryCode.length);
    }

    // EU VIES SOAP API
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soapenv:Body>
    <urn:checkVat>
      <urn:countryCode>${countryCode}</urn:countryCode>
      <urn:vatNumber>${cleanVat}</urn:vatNumber>
    </urn:checkVat>
  </soapenv:Body>
</soapenv:Envelope>`;

    const res = await fetch('https://ec.europa.eu/taxation_customs/vies/services/checkVatService', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: soapBody,
      signal: AbortSignal.timeout(10000),
    });

    const text = await res.text();

    const valid = text.includes('<valid>true</valid>');
    const nameMatch = text.match(/<name>([^<]+)<\/name>/);
    const addressMatch = text.match(/<address>([^<]+)<\/address>/);

    return {
      valid,
      name: nameMatch?.[1] || undefined,
      address: addressMatch?.[1] || undefined,
    };
  } catch (err) {
    console.error('[verify] VIES error:', err);
    return { valid: false };
  }
}

// ─── Website Availability Check ─────────────────────────
async function checkWebsite(url: string): Promise<{ reachable: boolean; status?: number }> {
  try {
    // Ensure URL has protocol
    let fullUrl = url;
    if (!fullUrl.startsWith('http')) fullUrl = `https://${fullUrl}`;

    const res = await fetch(fullUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    return { reachable: res.ok || res.status < 500, status: res.status };
  } catch {
    // Try with http if https fails
    try {
      let fullUrl = url;
      if (!fullUrl.startsWith('http')) fullUrl = `http://${fullUrl}`;
      const res = await fetch(fullUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
      });
      return { reachable: res.ok || res.status < 500, status: res.status };
    } catch {
      return { reachable: false };
    }
  }
}

// ─── Duplicate Detection ────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkDuplicate(
  supabase: any,
  app: Application
): Promise<{ isDuplicate: boolean; originalId?: string; originalName?: string }> {
  type Row = { id: string; organization_name: string; submission_count?: number };
  // Check by NIP (exact match)
  if (app.nip) {
    const { data } = await supabase
      .from('pilot_applications')
      .select('id, organization_name')
      .eq('nip', app.nip)
      .neq('id', app.id)
      .limit(1) as { data: Row[] | null };

    if (data && data.length > 0) {
      return { isDuplicate: true, originalId: data[0].id, originalName: data[0].organization_name };
    }
  }

  // Check by organization name (fuzzy — same name, same country)
  const { data: nameMatches } = await supabase
    .from('pilot_applications')
    .select('id, organization_name')
    .ilike('organization_name', `%${app.organization_name}%`)
    .eq('country', app.country)
    .neq('id', app.id)
    .limit(5) as { data: Row[] | null };

  if (nameMatches && nameMatches.length > 0) {
    // Check for close match (>80% similarity by simple inclusion)
    const normalizedName = app.organization_name.toLowerCase().replace(/[\s\-\.]/g, '');
    for (const match of nameMatches) {
      const matchNormalized = match.organization_name.toLowerCase().replace(/[\s\-\.]/g, '');
      if (normalizedName === matchNormalized || normalizedName.includes(matchNormalized) || matchNormalized.includes(normalizedName)) {
        return { isDuplicate: true, originalId: match.id, originalName: match.organization_name };
      }
    }
  }

  // Check by email (same person submitting for same org)
  const { data: emailMatches } = await supabase
    .from('pilot_applications')
    .select('id, organization_name')
    .eq('email', app.email)
    .neq('id', app.id)
    .limit(1) as { data: Row[] | null };

  if (emailMatches && emailMatches.length > 0) {
    return { isDuplicate: true, originalId: emailMatches[0].id, originalName: emailMatches[0].organization_name };
  }

  return { isDuplicate: false };
}

// ─── Evaluate Confidence ────────────────────────────────
function evaluateConfidence(result: VerificationResult, sector: string): { confidence: VerificationResult['confidence']; autoAccept: boolean } {
  let score = 0;
  const isPublicOrNgo = sector === 'publiczny' || sector === 'pozarzadowy';

  // VIES valid = +40 points
  if (result.checks.vies?.valid) score += 40;

  // Website reachable = +30 points (boosted to +50 for public/NGO)
  if (result.checks.website?.reachable) score += isPublicOrNgo ? 50 : 30;

  // Has NIP/VAT = +10 points (even if VIES check failed — could be timing)
  if (result.checks.vies) score += 10;

  // Not a duplicate = +20 points
  if (!result.checks.duplicate?.isDuplicate) score += 20;

  let confidence: VerificationResult['confidence'];
  if (score >= 70) confidence = 'high';
  else if (score >= 40) confidence = 'medium';
  else if (score > 0) confidence = 'low';
  else confidence = 'none';

  // Auto-accept if high confidence AND not duplicate
  const autoAccept = confidence === 'high' && !result.checks.duplicate?.isDuplicate;

  return { confidence, autoAccept };
}

// ─── Main Handler ───────────────────────────────────────
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'No database' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
  }

  // Fetch application
  const { data: app, error } = await supabase
    .from('pilot_applications')
    .select('id, organization_name, nip, krs, regon, website, country, city, sector, email')
    .eq('id', id)
    .single();

  if (error || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  console.log(`[verify] Starting verification for: ${app.organization_name} (${app.country})`);

  const result: VerificationResult = {
    exists: false,
    confidence: 'none',
    notes: [],
    checks: {},
  };

  // ─── 1. VIES VAT Check (if NIP provided) ────────────
  if (app.nip) {
    console.log(`[verify] Checking VIES for ${app.country}${app.nip}...`);
    const vies = await checkVIES(app.nip, app.country);
    result.checks.vies = vies;

    if (vies.valid) {
      result.notes.push(`✅ VIES: VAT aktywny. Nazwa: ${vies.name || 'brak'}. Adres: ${vies.address || 'brak'}`);
      result.exists = true;
    } else {
      result.notes.push(`⚠️ VIES: VAT nieważny lub niedostępny dla ${app.country}${app.nip}`);
    }
  } else {
    result.notes.push('ℹ️ Brak NIP/VAT — pominięto weryfikację VIES');
  }

  // ─── 2. Website Check ───────────────────────────────
  if (app.website) {
    console.log(`[verify] Checking website: ${app.website}...`);
    const web = await checkWebsite(app.website);
    result.checks.website = web;

    if (web.reachable) {
      result.notes.push(`✅ Strona ${app.website} dostępna (HTTP ${web.status})`);
      result.exists = true;
    } else {
      result.notes.push(`⚠️ Strona ${app.website} niedostępna`);
    }
  } else {
    result.notes.push('ℹ️ Brak strony www — pominięto weryfikację witryny');
  }

  // ─── 3. Duplicate Check ─────────────────────────────
  console.log(`[verify] Checking duplicates...`);
  const dup = await checkDuplicate(supabase, app as Application);
  result.checks.duplicate = dup;

  if (dup.isDuplicate) {
    result.notes.push(`🔄 Duplikat: znaleziono istniejące zgłoszenie "${dup.originalName}" (${dup.originalId})`);

    // Increment submission_count on original
    const { data: original } = await supabase
      .from('pilot_applications')
      .select('submission_count')
      .eq('id', dup.originalId)
      .single() as { data: { submission_count: number } | null };

    if (original) {
      await supabase
        .from('pilot_applications')
        .update({ submission_count: (original.submission_count || 1) + 1 })
        .eq('id', dup.originalId);
    }
  } else {
    result.notes.push('✅ Brak duplikatów — unikalne zgłoszenie');
  }

  // ─── 4. Evaluate & Decide ───────────────────────────
  const { confidence, autoAccept } = evaluateConfidence(result, app.sector);
  result.confidence = confidence;

  const notesText = result.notes.join('\n');
  console.log(`[verify] Result: confidence=${confidence}, autoAccept=${autoAccept}\n${notesText}`);

  // Update application
  const updates: Record<string, unknown> = {
    ai_verified: true,
    ai_verification_notes: notesText,
  };

  if (dup.isDuplicate) {
    updates.status = 'rejected';
    updates.duplicate_of = dup.originalId;
    updates.ai_verification_notes = notesText + '\n❌ Automatycznie odrzucone jako duplikat';
  } else if (autoAccept) {
    updates.status = 'accepted';
    updates.ai_verification_notes = notesText + '\n✅ Automatycznie zaakceptowane (wysoka wiarygodność)';
  } else {
    updates.status = 'reviewed';
    updates.ai_verification_notes = notesText + `\n⏳ Wymaga ręcznej weryfikacji (pewność: ${confidence})`;
  }

  await supabase
    .from('pilot_applications')
    .update(updates)
    .eq('id', id);

  return NextResponse.json({
    ok: true,
    confidence,
    autoAccept,
    isDuplicate: dup.isDuplicate,
    notes: result.notes,
  });
}
