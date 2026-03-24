import { NextRequest, NextResponse } from "next/server";
import { lookupOrganization } from "../../../../lib/olympiad/registry-lookup";

/**
 * GET /api/olympiad/registry-lookup?nip=1234567890
 *
 * Look up organization in public registers (RSPO for schools, KRS for NGOs/companies).
 * Returns: org name, type, address, authorized representatives.
 *
 * Flow:
 * 1. Dyrektor/koordynator wpisuje NIP
 * 2. System odpytuje RSPO → KRS
 * 3. Zwraca listę osób uprawnionych do reprezentacji
 * 4. Użytkownik wybiera siebie lub "inna osoba" (pełnomocnik)
 */
export async function GET(req: NextRequest) {
  const nip = req.nextUrl.searchParams.get("nip");

  if (!nip) {
    return NextResponse.json(
      { error: "Podaj NIP organizacji", error_en: "Provide organization NIP" },
      { status: 400 }
    );
  }

  try {
    const result = await lookupOrganization(nip);

    return NextResponse.json({
      success: result.found,
      data: {
        source: result.source,
        org_name: result.org_name,
        org_type: result.org_type,
        address: result.address,
        nip: result.nip,
        regon: result.regon,
        krs: result.krs,
        representatives: result.representatives,
      },
      error: result.error || null,
    });
  } catch (error) {
    console.error("[Registry Lookup] Error:", error);
    return NextResponse.json(
      { success: false, error: "Błąd wyszukiwania w rejestrze" },
      { status: 500 }
    );
  }
}
