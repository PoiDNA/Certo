import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";
import { verifyTurnstile } from "../../../../lib/olympiad/turnstile";

/**
 * POST /api/olympiad/review
 *
 * Submit a peer review for a Certo Action (Phase III).
 * Scale 1–5 per criterion, converted to total_score 0–100.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenant_id,
      reviewer_org_id,
      target_org_id,
      country,
      checklist_scores,
      total_score,
      ring_position,
      turnstile_token,
    } = body;

    if (!tenant_id || !checklist_scores || total_score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Turnstile verification
    const turnstileValid = await verifyTurnstile(turnstile_token || "");
    if (!turnstileValid) {
      return NextResponse.json({ error: "Bot detected" }, { status: 403 });
    }

    const supabase = getOlympiadSupabase();

    if (supabase) {
      const { error } = await supabase.from("olympiad_peer_reviews").insert({
        tenant_id,
        reviewer_org_id: reviewer_org_id || null,
        target_org_id: target_org_id || null,
        country: country || "unknown",
        checklist_scores,
        total_score,
        ring_position: ring_position || null,
      });

      if (error) {
        console.error("[Peer Review] Supabase error:", error);
        // Fall through to log-only
      } else {
        // Update the average peer_review_avg on the target action
        if (target_org_id) {
          const { data: reviews } = await supabase
            .from("olympiad_peer_reviews")
            .select("total_score")
            .eq("target_org_id", target_org_id)
            .eq("tenant_id", tenant_id);

          if (reviews && reviews.length > 0) {
            const avg = Math.round(
              reviews.reduce((sum: number, r: { total_score: number }) => sum + r.total_score, 0) /
                reviews.length
            );
            await supabase
              .from("olympiad_actions")
              .update({ peer_review_avg: avg })
              .eq("org_id", target_org_id);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Review saved",
        });
      }
    }

    // Fallback: log only
    console.log("[Peer Review] Saved (log-only):", {
      tenant_id,
      checklist_scores,
      total_score,
    });

    return NextResponse.json({
      success: true,
      message: "Review recorded (log-only mode)",
    });
  } catch (e) {
    console.error("[Peer Review] Error:", e);
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 }
    );
  }
}
