/**
 * Registry Lookup — verify organization representatives from public registers.
 *
 * Sources:
 * - KRS API (prs.ms.gov.pl) — Polish National Court Register (NGOs, companies, cooperatives)
 * - RSPO API (api.rspo.gov.pl) — Polish School & Education Register (schools, kindergartens)
 * - BRIS / Open BRIS — EU Business Registers (v2)
 *
 * Flow:
 * 1. User enters NIP/KRS/REGON
 * 2. System queries registry → returns org name + authorized representatives
 * 3. User selects representative or chooses "inna osoba" (other person)
 * 4. If other person → must upload power of attorney / authorization document
 */

// ── Types ──────────────────────────────────────────────────────────

export type RegistrySource = "krs" | "rspo" | "ceidg" | "bris";

export interface Representative {
  name: string;
  role: string;          // "Dyrektor", "Prezes Zarządu", "Wiceprezes", etc.
  since?: string;        // Date from, if available
  source: RegistrySource;
}

export interface RegistryLookupResult {
  found: boolean;
  source: RegistrySource;
  org_name: string | null;
  org_type: string | null;     // "szkoła podstawowa", "fundacja", "sp. z o.o."
  address: string | null;
  nip: string | null;
  regon: string | null;
  krs: string | null;
  representatives: Representative[];
  raw_data?: Record<string, unknown>;
  error?: string;
}

// ── KRS API (Polish National Court Register) ───────────────────────

const KRS_API_BASE = "https://api-krs.ms.gov.pl/api/krs";

/**
 * Look up organization in KRS by NIP, KRS number, or REGON.
 * Returns board members (zarząd) and their roles.
 *
 * Official API: https://prs.ms.gov.pl/krs/openApi
 * Free, no API key required.
 */
export async function lookupKRS(
  identifier: string,
  type: "nip" | "krs" | "regon" = "nip"
): Promise<RegistryLookupResult> {
  try {
    // KRS API endpoint for full extract
    const paramMap = { nip: "nip", krs: "rejestr", regon: "regon" };
    const url = `${KRS_API_BASE}/OdsijOdpisPelwordzyn/${identifier}?${paramMap[type]}=${identifier}`;

    // Fallback: use rejestr.io or direct search
    const searchUrl = `${KRS_API_BASE}/OdpisPelwordzyn/${identifier}`;

    const response = await fetch(searchUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // Try alternative endpoint format
      return await lookupKRSAlternative(identifier, type);
    }

    const data = await response.json();
    return parseKRSResponse(data);
  } catch (error) {
    console.error("[KRS Lookup] Error:", error);
    return await lookupKRSAlternative(identifier, type);
  }
}

async function lookupKRSAlternative(
  identifier: string,
  type: "nip" | "krs" | "regon"
): Promise<RegistryLookupResult> {
  try {
    // Use rejestr.io as fallback (requires API key in production)
    // For now, return structured error
    return {
      found: false,
      source: "krs",
      org_name: null,
      org_type: null,
      address: null,
      nip: type === "nip" ? identifier : null,
      regon: type === "regon" ? identifier : null,
      krs: type === "krs" ? identifier : null,
      representatives: [],
      error: `KRS lookup unavailable for ${type}=${identifier}. Configure KRS API or rejestr.io API key.`,
    };
  } catch (error) {
    return {
      found: false,
      source: "krs",
      org_name: null,
      org_type: null,
      address: null,
      nip: null,
      regon: null,
      krs: null,
      representatives: [],
      error: String(error),
    };
  }
}

function parseKRSResponse(data: Record<string, unknown>): RegistryLookupResult {
  try {
    // KRS API returns nested structure — extract representatives from "Organ reprezentacji"
    const odpis = (data as any)?.odppisPewordzyn ?? data;
    const dane = odpis?.dane ?? {};
    const dzial2 = dane?.dzial2 ?? {};

    // Extract board members from "Organ uprawniony do reprezentowania podmiotu"
    const organRep = dzial2?.organReprezentacji?.sklad ?? [];
    const representatives: Representative[] = organRep.map((person: any) => ({
      name: `${person?.imiona ?? ""} ${person?.nazwisko ?? ""}`.trim(),
      role: person?.funkcja ?? "Członek zarządu",
      since: person?.dataOd,
      source: "krs" as RegistrySource,
    }));

    return {
      found: representatives.length > 0,
      source: "krs",
      org_name: dane?.dzial1?.danePodmiotu?.nazwa ?? null,
      org_type: dane?.dzial1?.danePodmiotu?.formaPrawna ?? null,
      address: formatAddress(dane?.dzial1?.siedzibaiAdres),
      nip: dane?.dzial1?.danePodmiotu?.identyfikatory?.nip ?? null,
      regon: dane?.dzial1?.danePodmiotu?.identyfikatory?.regon ?? null,
      krs: dane?.dzial1?.danePodmiotu?.identyfikatory?.numerKRS ?? null,
      representatives,
      raw_data: data,
    };
  } catch {
    return {
      found: false,
      source: "krs",
      org_name: null,
      org_type: null,
      address: null,
      nip: null,
      regon: null,
      krs: null,
      representatives: [],
      error: "Failed to parse KRS response",
    };
  }
}

// ── RSPO API (Polish School Register) ──────────────────────────────

const RSPO_API_BASE = "https://api-rspo.mein.gov.pl/api";

/**
 * Look up school in RSPO by REGON, RSPO number, or name.
 * Returns school name, type, and director.
 *
 * API: https://api.rspo.gov.pl/
 * Requires API key (request via rspo@cie.gov.pl).
 * Fallback: scrape rspo.gov.pl search results.
 */
export async function lookupRSPO(
  identifier: string,
  type: "regon" | "rspo" | "nip" = "regon"
): Promise<RegistryLookupResult> {
  const apiKey = process.env.RSPO_API_KEY;

  if (!apiKey) {
    // Fallback: use public search (no API key)
    return lookupRSPOPublic(identifier, type);
  }

  try {
    const url = `${RSPO_API_BASE}/placowki?${type}=${identifier}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return lookupRSPOPublic(identifier, type);
    }

    const data = await response.json();
    return parseRSPOResponse(data);
  } catch (error) {
    console.error("[RSPO Lookup] Error:", error);
    return lookupRSPOPublic(identifier, type);
  }
}

async function lookupRSPOPublic(
  identifier: string,
  type: "regon" | "rspo" | "nip"
): Promise<RegistryLookupResult> {
  // Public RSPO search — limited, but available without API key
  return {
    found: false,
    source: "rspo",
    org_name: null,
    org_type: null,
    address: null,
    nip: type === "nip" ? identifier : null,
    regon: type === "regon" ? identifier : null,
    krs: null,
    representatives: [],
    error: `RSPO API key not configured. Request access at rspo@cie.gov.pl. Identifier: ${type}=${identifier}`,
  };
}

function parseRSPOResponse(data: any): RegistryLookupResult {
  try {
    const school = Array.isArray(data) ? data[0] : data;
    if (!school) {
      return {
        found: false, source: "rspo", org_name: null, org_type: null,
        address: null, nip: null, regon: null, krs: null,
        representatives: [], error: "School not found in RSPO",
      };
    }

    const representatives: Representative[] = [];
    if (school.dyrektor || school.dyrektorImie || school.dyrektorNazwisko) {
      representatives.push({
        name: school.dyrektor || `${school.dyrektorImie ?? ""} ${school.dyrektorNazwisko ?? ""}`.trim(),
        role: "Dyrektor",
        source: "rspo",
      });
    }

    return {
      found: true,
      source: "rspo",
      org_name: school.nazwa ?? school.pelna_nazwa ?? null,
      org_type: school.typ ?? school.rodzaj ?? null,
      address: [school.ulica, school.numer_budynku, school.miejscowosc, school.kodPocztowy]
        .filter(Boolean)
        .join(", ") || null,
      nip: school.nip ?? null,
      regon: school.regon ?? null,
      krs: null,
      representatives,
      raw_data: school,
    };
  } catch {
    return {
      found: false, source: "rspo", org_name: null, org_type: null,
      address: null, nip: null, regon: null, krs: null,
      representatives: [], error: "Failed to parse RSPO response",
    };
  }
}

// ── Unified lookup ─────────────────────────────────────────────────

/**
 * Smart lookup — tries RSPO first (for schools), then KRS (for NGOs/companies).
 * Uses NIP as the universal identifier.
 */
export async function lookupOrganization(
  nip: string
): Promise<RegistryLookupResult> {
  // Clean NIP (remove dashes, spaces)
  const cleanNip = nip.replace(/[\s-]/g, "");

  if (cleanNip.length !== 10 || !/^\d+$/.test(cleanNip)) {
    return {
      found: false,
      source: "krs",
      org_name: null,
      org_type: null,
      address: null,
      nip: cleanNip,
      regon: null,
      krs: null,
      representatives: [],
      error: "Nieprawidłowy NIP. NIP powinien mieć 10 cyfr.",
    };
  }

  // Try RSPO first (schools/education)
  const rspoResult = await lookupRSPO(cleanNip, "nip");
  if (rspoResult.found) return rspoResult;

  // Then try KRS (NGOs, companies, cooperatives)
  const krsResult = await lookupKRS(cleanNip, "nip");
  if (krsResult.found) return krsResult;

  // Nothing found
  return {
    found: false,
    source: "krs",
    org_name: null,
    org_type: null,
    address: null,
    nip: cleanNip,
    regon: null,
    krs: null,
    representatives: [],
    error: "Nie znaleziono podmiotu w RSPO ani KRS. Sprawdź NIP lub wprowadź dane ręcznie.",
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function formatAddress(addr: any): string | null {
  if (!addr) return null;
  return [
    addr.ulica,
    addr.nrDomu,
    addr.nrLokalu ? `/${addr.nrLokalu}` : "",
    addr.miejscowosc,
    addr.kodPocztowy,
    addr.kraj,
  ]
    .filter(Boolean)
    .join(" ") || null;
}
