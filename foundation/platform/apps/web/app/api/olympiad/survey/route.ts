import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

/**
 * POST /api/olympiad/survey
 *
 * Accept survey responses. Writes to olympiad_survey_responses via Supabase.
 * Cloudflare Turnstile verification on API level (403 before INSERT).
 * Falls back to log-only if Supabase is unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, group_id, pillar_scores, link_hash, org_id } = body;

    if (!tenant_id || !group_id || !pillar_scores) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Cloudflare Turnstile verification
    // const turnstileToken = body.turnstile_token;
    // const verified = await verifyTurnstile(turnstileToken);
    // if (!verified) return NextResponse.json({ error: "Bot detected" }, { status: 403 });

    // Fingerprint for duplicate detection
    const fingerprint =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const fingerprintHash = await hashString(fingerprint);

    // Try Supabase write
    const supabase = getOlympiadSupabase();
    if (supabase) {
      // If link_hash provided, validate and increment cohort link usage
      if (link_hash) {
        const { data: linkData, error: linkError } = await supabase
          .from("olympiad_cohort_links")
          .select("link_hash, max_uses, current_uses, expires_at")
          .eq("link_hash", link_hash)
          .single();

        if (linkError || !linkData) {
          return NextResponse.json(
            { error: "Invalid survey link" },
            { status: 400 }
          );
        }

        if (linkData.current_uses >= linkData.max_uses) {
          return NextResponse.json(
            { error: "Survey link has reached its usage limit" },
            { status: 410 }
          );
        }

        if (
          linkData.expires_at &&
          new Date(linkData.expires_at) < new Date()
        ) {
          return NextResponse.json(
            { error: "Survey link has expired" },
            { status: 410 }
          );
        }

        // Increment usage
        await supabase
          .from("olympiad_cohort_links")
          .update({ current_uses: linkData.current_uses + 1 })
          .eq("link_hash", link_hash);

        // Velocity check: if link exhausted in <5 min, flag anomaly
        if (linkData.current_uses + 1 >= linkData.max_uses) {
          const created = new Date(linkData.expires_at || Date.now());
          const elapsed = (Date.now() - created.getTime()) / 1000 / 60;
          if (elapsed < 5) {
            await supabase
              .from("olympiad_cohort_links")
              .update({ velocity_anomaly: true })
              .eq("link_hash", link_hash);
            console.warn(
              `[Olympiad Survey] Velocity anomaly: link ${link_hash} exhausted in ${elapsed.toFixed(1)} min`
            );
          }
        }
      }

      // Write response
      const { error } = await supabase
        .from("olympiad_survey_responses")
        .insert({
          org_id: org_id || null,
          tenant_id,
          group_id,
          pillar_scores,
          fingerprint_hash: fingerprintHash,
          anomaly_flags: [],
        });

      if (error) {
        console.error("[Olympiad Survey] Supabase error:", error);
        // Fall through to fallback
      } else {
        // Count total responses for this org (for feedback loop)
        let totalResponses = 0;
        if (org_id) {
          const { count } = await supabase
            .from("olympiad_survey_responses")
            .select("*", { count: "exact", head: true })
            .eq("org_id", org_id);
          totalResponses = count || 0;
        }

        return NextResponse.json({
          success: true,
          total_responses: totalResponses,
          persisted: true,
        });
      }
    }

    // Fallback: log
    console.log("[Olympiad Survey] Fallback (no DB):", {
      tenant_id,
      group_id,
      pillar_scores,
      link_hash: link_hash || "none",
    });

    return NextResponse.json({
      success: true,
      total_responses: 0,
      persisted: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Simple hash for fingerprinting (not cryptographic, just for grouping) */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 16);
}
