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

// ── Biała Lista VAT API (Ministry of Finance) ──────────────────────

const WL_API_BASE = "https://wl-api.mf.gov.pl/api/search";

/**
 * Look up organization via Biała Lista VAT (White List) API.
 * Free, official, no API key required.
 * Returns: name, address, NIP, REGON, KRS, and REPRESENTATIVES.
 *
 * Docs: https://wl-api.mf.gov.pl
 */
export async function lookupKRS(
  identifier: string,
  type: "nip" | "krs" | "regon" = "nip"
): Promise<RegistryLookupResult> {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const url = `${WL_API_BASE}/${type}/${identifier}?date=${today}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        found: false, source: "krs", org_name: null, org_type: null,
        address: null, nip: type === "nip" ? identifier : null,
        regon: type === "regon" ? identifier : null,
        krs: type === "krs" ? identifier : null,
        representatives: [],
        error: `Biała Lista API returned ${response.status}`,
      };
    }

    const data = await response.json();
    const subject = data?.result?.subject;

    if (!subject) {
      return {
        found: false, source: "krs", org_name: null, org_type: null,
        address: null, nip: type === "nip" ? identifier : null,
        regon: type === "regon" ? identifier : null,
        krs: type === "krs" ? identifier : null,
        representatives: [],
        error: type === "nip"
          ? "Podmiot nie jest podatnikiem VAT (szkoły publiczne, jednostki budżetowe). Spróbuj wyszukać po REGON lub wpisz dane ręcznie."
          : "Nie znaleziono podmiotu po REGON w Białej Liście VAT.",
      };
    }

    // Parse representatives from Biała Lista
    const representatives: Representative[] = (subject.representatives || []).map((rep: any) => {
      const name = [rep.firstName, rep.lastName].filter(Boolean).join(" ") || rep.companyName || "";
      return {
        name,
        role: "Reprezentant",
        source: "krs" as RegistrySource,
      };
    });

    // Parse authorized clerks
    const authorizedClerks: Representative[] = (subject.authorizedClerks || []).map((clerk: any) => {
      const name = [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") || clerk.companyName || "";
      return {
        name,
        role: "Pełnomocnik",
        source: "krs" as RegistrySource,
      };
    });

    return {
      found: true,
      source: "krs",
      org_name: subject.name || null,
      org_type: subject.statusVat ? `VAT: ${subject.statusVat}` : null,
      address: subject.workingAddress || subject.residenceAddress || null,
      nip: subject.nip || null,
      regon: subject.regon || null,
      krs: subject.krs || null,
      representatives: [...representatives, ...authorizedClerks],
      raw_data: subject,
    };
  } catch (error) {
    console.error("[Biała Lista] Error:", error);
    return {
      found: false, source: "krs", org_name: null, org_type: null,
      address: null, nip: type === "nip" ? identifier : null,
      regon: type === "regon" ? identifier : null, krs: null,
      representatives: [],
      error: `Błąd połączenia z Białą Listą VAT: ${error}`,
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

  // Try Biała Lista VAT (works for companies, NGOs with VAT registration)
  const wlResult = await lookupKRS(cleanNip, "nip");
  if (wlResult.found) return wlResult;

  // Then try RSPO (schools — requires API key)
  const rspoResult = await lookupRSPO(cleanNip, "nip");
  if (rspoResult.found) return rspoResult;

  // Nothing found — provide helpful guidance
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
    error: "Nie znaleziono podmiotu automatycznie. Szkoły publiczne i jednostki budżetowe nie są w rejestrze VAT. Kliknij Dalej i wpisz dane ręcznie — zweryfikujemy je w kolejnym kroku.",
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
