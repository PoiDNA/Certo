import { NextResponse } from 'next/server';

interface LookupResult {
  found: boolean;
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  source?: string;
}

// ─── VIES VAT Lookup (all 27 EU countries) ──────────────
async function lookupVIES(vatNumber: string, countryCode: string): Promise<LookupResult> {
  try {
    let cleanVat = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
    if (cleanVat.startsWith(countryCode)) {
      cleanVat = cleanVat.slice(countryCode.length);
    }

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

    if (!valid) return { found: false };

    const nameMatch = text.match(/<name>([^<]+)<\/name>/);
    const addressMatch = text.match(/<address>([^<]+)<\/address>/);

    const fullAddress = addressMatch?.[1]?.trim() || '';

    // Try to parse city and postal code from address
    // Typical formats: "UL. EXAMPLE 1\n00-001 WARSZAWA" or "Strasse 1, 10115 Berlin"
    let city = '';
    let postalCode = '';
    const lines = fullAddress.split(/[\n,]+/).map((l: string) => l.trim()).filter(Boolean);

    if (lines.length >= 2) {
      const lastLine = lines[lines.length - 1];
      // Match postal code + city: "00-001 WARSZAWA" or "10115 BERLIN"
      const postalMatch = lastLine.match(/^(\d[\d\-\s]{2,8}\d?)\s+(.+)$/);
      if (postalMatch) {
        postalCode = postalMatch[1].trim();
        city = postalMatch[2].trim();
      } else {
        city = lastLine;
      }
    } else if (lines.length === 1) {
      // Try to extract from single line
      const postalMatch = fullAddress.match(/(\d[\d\-\s]{2,8}\d?)\s+([A-ZŁŚŻŹĆŃÓ][a-ząęółśżźćń\s]+)/);
      if (postalMatch) {
        postalCode = postalMatch[1].trim();
        city = postalMatch[2].trim();
      }
    }

    // Capitalize city name properly
    if (city) {
      city = city.split(' ').map((w: string) =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');
    }

    return {
      found: true,
      name: nameMatch?.[1]?.trim() || undefined,
      address: lines.length > 1 ? lines.slice(0, -1).join(', ') : fullAddress,
      city,
      postalCode,
      country: countryCode,
      source: 'VIES (EU)',
    };
  } catch (err) {
    console.error('[lookup] VIES error:', err);
    return { found: false };
  }
}

// ─── Polish KRS Lookup ──────────────────────────────────
async function lookupKRS(krsNumber: string): Promise<LookupResult> {
  try {
    const cleanKrs = krsNumber.replace(/\D/g, '').padStart(10, '0');

    const res = await fetch(`https://api-krs.ms.gov.pl/api/krs/OdsijODP/${cleanKrs}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { found: false };

    const data = await res.json();
    const odppiS = data?.odppisSzcreg || data?.odpisSzcreg;

    if (!odppiS) {
      // Try alternative endpoint
      const res2 = await fetch(`https://api-krs.ms.gov.pl/api/krs/OdpisPelny/${cleanKrs}?rejestr=P&format=json`, {
        signal: AbortSignal.timeout(8000),
      });

      if (!res2.ok) return { found: false };
      const data2 = await res2.json();

      const dane = data2?.odppisSzcreg?.dane || data2?.odpisSzcreg?.dane;
      if (!dane) return { found: false };

      return {
        found: true,
        name: dane.dzial1?.danePodmiotu?.nazwa,
        address: dane.dzial1?.siedzibaIAdres?.adres ?
          `${dane.dzial1.siedzibaIAdres.adres.ulica || ''} ${dane.dzial1.siedzibaIAdres.adres.nrDomu || ''}`.trim() :
          undefined,
        city: dane.dzial1?.siedzibaIAdres?.adres?.miejscowosc,
        postalCode: dane.dzial1?.siedzibaIAdres?.adres?.kodPocztowy,
        country: 'PL',
        source: 'KRS',
      };
    }

    return { found: false };
  } catch (err) {
    console.error('[lookup] KRS error:', err);
    return { found: false };
  }
}

// ─── Polish NIP Lookup via CEIDG/GUS ────────────────────
async function lookupPolishNIP(nip: string): Promise<LookupResult> {
  try {
    const cleanNip = nip.replace(/[\s\-]/g, '');

    // Try rejestr.io (public, no API key needed)
    const res = await fetch(`https://rejestr.io/api/v2/org?nip=${cleanNip}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const org = data[0];
        return {
          found: true,
          name: org.name || org.nazwa,
          address: org.address?.street || org.ulica,
          city: org.address?.city || org.miasto,
          postalCode: org.address?.zip || org.kodPocztowy,
          country: 'PL',
          source: 'rejestr.io',
        };
      }
    }

    // Fallback: just use VIES
    return lookupVIES(cleanNip, 'PL');
  } catch {
    // Fallback to VIES
    return lookupVIES(nip, 'PL');
  }
}

// ─── Main Handler ───────────────────────────────────────
export async function POST(request: Request) {
  const body = await request.json();
  const { nip, krs, country } = body as { nip?: string; krs?: string; country?: string };

  if (!nip && !krs) {
    return NextResponse.json({ error: 'Podaj NIP/VAT lub KRS' }, { status: 400 });
  }

  const countryCode = (country || 'PL').toUpperCase();

  // Strategy:
  // 1. If KRS provided (Poland only) → try KRS API
  // 2. If NIP provided + PL → try Polish lookup, fallback to VIES
  // 3. If NIP provided + other EU → use VIES
  let result: LookupResult = { found: false };

  if (krs && countryCode === 'PL') {
    result = await lookupKRS(krs);
  }

  if (!result.found && nip) {
    if (countryCode === 'PL') {
      result = await lookupPolishNIP(nip);
    } else {
      result = await lookupVIES(nip, countryCode);
    }
  }

  if (!result.found) {
    return NextResponse.json({
      found: false,
      message: 'Nie znaleziono podmiotu. Wypełnij dane ręcznie.',
    });
  }

  return NextResponse.json(result);
}
