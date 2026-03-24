import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/olympiad/survey
 *
 * Accepts survey responses. In production:
 * 1. Validates Cloudflare Turnstile token (403 if invalid — no DB write)
 * 2. Validates cohort link (if provided)
 * 3. Checks fingerprint for duplicate detection
 * 4. Writes to olympiad_survey_responses via service role
 *
 * For MVP/demo: accepts and logs the response.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, group_id, pillar_scores, link_hash } = body;

    if (!tenant_id || !group_id || !pillar_scores) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Cloudflare Turnstile verification
    // const turnstileToken = body.turnstile_token;
    // if (!turnstileToken) return NextResponse.json({ error: "Bot detected" }, { status: 403 });
    // const verified = await verifyTurnstile(turnstileToken);
    // if (!verified) return NextResponse.json({ error: "Bot detected" }, { status: 403 });

    // TODO: Validate cohort link (check max_uses, expiry, velocity)
    // if (link_hash) { ... }

    // TODO: Fingerprint duplicate detection
    // const fingerprint = req.headers.get("x-fingerprint");

    // TODO: Write to Supabase (service role)
    // const supabase = getServiceSupabase();
    // await supabase.from("olympiad_survey_responses").insert({ ... });

    // For now: log and accept
    console.log("[Olympiad Survey]", {
      tenant_id,
      group_id,
      pillar_scores,
      link_hash: link_hash || "none",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Survey response recorded",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
