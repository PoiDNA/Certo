import { NextRequest, NextResponse } from "next/server";
import { lookupOrganization, lookupKRS, lookupRSPO } from "../../../../lib/olympiad/registry-lookup";

/**
 * GET /api/olympiad/registry-lookup?nip=1234567890
 * GET /api/olympiad/registry-lookup?regon=000000000
 *
 * Look up organization in public registers (RSPO for schools, KRS for NGOs/companies).
 * Accepts NIP (10 digits) or REGON (9 or 14 digits).
 * Returns: org name, type, address, authorized representatives.
 */
export async function GET(req: NextRequest) {
  const nip = req.nextUrl.searchParams.get("nip");
  const regon = req.nextUrl.searchParams.get("regon");

  if (!nip && !regon) {
    return NextResponse.json(
      { error: "Podaj NIP lub REGON organizacji", error_en: "Provide organization NIP or REGON" },
      { status: 400 }
    );
  }

  try {
    let result;

    if (regon) {
      // REGON lookup — try RSPO first (schools use REGON), then KRS
      const cleanRegon = regon.replace(/[\s-]/g, "");
      result = await lookupRSPO(cleanRegon, "regon");
      if (!result.found) {
        result = await lookupKRS(cleanRegon, "regon");
      }
    } else {
      // NIP lookup — unified (RSPO → KRS)
      result = await lookupOrganization(nip!);
    }

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
