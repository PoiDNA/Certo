import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

/**
 * POST /api/olympiad/verify-identity
 *
 * Initiate identity verification for Organization Representative.
 * MVP: generates a bank transfer code (1 gr verification).
 * v2: will integrate with Kontomatik/Autenti/Veriff.
 *
 * Body: { user_id, method: "bank_transfer" | "open_banking" | ... }
 * Returns: { verification_id, transfer_code, transfer_iban, instructions }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, method = "bank_transfer" } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Generate unique transfer code
    const transferCode = `CERTO-${generateCode(6)}`;
    const transferIban = process.env.CERTO_VERIFICATION_IBAN || "PL00 0000 0000 0000 0000 0000 0000";

    const supabase = getOlympiadSupabase();
    let verificationId = crypto.randomUUID();

    if (supabase) {
      const { data, error } = await supabase
        .from("identity_verifications")
        .insert({
          user_id,
          method,
          status: "pending",
          transfer_code: method === "bank_transfer" ? transferCode : null,
          transfer_amount: 1, // 1 grosz / 1 cent
          transfer_iban: transferIban,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days to complete
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          user_agent: req.headers.get("user-agent"),
        })
        .select("id")
        .single();

      if (data) verificationId = data.id;
      if (error) console.error("[Verify Identity] DB error:", error);
    }

    // Response based on method
    if (method === "bank_transfer") {
      return NextResponse.json({
        success: true,
        verification_id: verificationId,
        method: "bank_transfer",
        transfer: {
          code: transferCode,
          iban: transferIban,
          amount: "0.01",
          currency: "PLN",
          title: transferCode,
          recipient: "Fundacja Certo Governance Institute",
        },
        instructions: {
          pl: [
            `Wykonaj przelew na kwotę 0,01 PLN na konto: ${transferIban}`,
            `W tytule przelewu wpisz dokładnie: ${transferCode}`,
            "Po zaksięgowaniu przelewu (1-2 dni robocze) Twoja tożsamość zostanie potwierdzona",
            "Imię i nazwisko z konta bankowego zostaną przypisane do Twojego profilu Certo",
          ],
          en: [
            `Transfer 0.01 PLN to account: ${transferIban}`,
            `In the transfer title enter exactly: ${transferCode}`,
            "After the transfer is processed (1-2 business days) your identity will be confirmed",
            "The name from your bank account will be linked to your Certo profile",
          ],
        },
      });
    }

    // Placeholder for v2 methods
    return NextResponse.json({
      success: true,
      verification_id: verificationId,
      method,
      message: `${method} verification will be available in v2. For now, use bank_transfer.`,
    });
  } catch (error) {
    console.error("[Verify Identity] Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

/**
 * GET /api/olympiad/verify-identity?user_id=xxx
 *
 * Check verification status.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const supabase = getOlympiadSupabase();
  if (!supabase) {
    return NextResponse.json({
      verified: false,
      status: "pending",
      method: "bank_transfer",
    });
  }

  const { data } = await supabase
    .from("identity_verifications")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "verified")
    .order("verified_at", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    return NextResponse.json({
      verified: true,
      status: "verified",
      verified_name: data.verified_name,
      verified_at: data.verified_at,
      method: data.method,
    });
  }

  // Check pending
  const { data: pending } = await supabase
    .from("identity_verifications")
    .select("id, method, transfer_code, status, created_at")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    verified: false,
    status: pending?.status || "none",
    pending: pending || null,
  });
}

function generateCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No O/0/I/1 confusion
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
