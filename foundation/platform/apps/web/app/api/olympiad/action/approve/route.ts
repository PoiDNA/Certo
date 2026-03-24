import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../../lib/olympiad/supabase";

/**
 * POST /api/olympiad/action/approve
 *
 * Organization Representative approves Certo Action plan or step completion.
 * Requires verified identity (banking verification).
 *
 * Body: {
 *   org_id, tenant_id,
 *   representative_id,      // user_id of the representative
 *   approval_type: "action_plan" | "step_completion",
 *   plan_id?,               // which plan (for multi-plan)
 *   step_index?,            // which step (for step_completion)
 *   decision: "approved" | "rejected" | "revision_requested",
 *   comment?
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      org_id,
      tenant_id,
      representative_id,
      approval_type,
      plan_id,
      step_index,
      decision,
      comment,
    } = body;

    if (!org_id || !tenant_id || !representative_id || !approval_type || !decision) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getOlympiadSupabase();

    // Check identity verification
    let verifiedIdentity = false;
    let verificationId = null;
    let verifiedName = null;

    if (supabase) {
      const { data: verification } = await supabase
        .from("identity_verifications")
        .select("id, verified_name, status")
        .eq("user_id", representative_id)
        .eq("status", "verified")
        .order("verified_at", { ascending: false })
        .limit(1)
        .single();

      if (verification) {
        verifiedIdentity = true;
        verificationId = verification.id;
        verifiedName = verification.verified_name;
      }
    }

    if (!verifiedIdentity) {
      return NextResponse.json({
        error: "identity_not_verified",
        message: "Tożsamość Reprezentanta nie została jeszcze zweryfikowana. Wykonaj przelew weryfikacyjny.",
        message_en: "Representative identity not yet verified. Complete the bank transfer verification.",
      }, { status: 403 });
    }

    // Record approval
    if (supabase) {
      const { error } = await supabase
        .from("olympiad_action_approvals")
        .insert({
          org_id,
          tenant_id,
          representative_id,
          verification_id: verificationId,
          approval_type,
          plan_id,
          step_index,
          decision,
          comment,
          verified_identity: true,
        });

      if (error) {
        console.error("[Action Approve] DB error:", error);
        return NextResponse.json({ error: "Failed to record approval" }, { status: 500 });
      }

      // If approving step completion, update the step status
      if (approval_type === "step_completion" && decision === "approved") {
        // In production: update olympiad_actions.steps[step_index].status = "completed"
        console.log(`[Action Approve] Step ${step_index} of plan ${plan_id} approved by ${verifiedName}`);
      }
    }

    return NextResponse.json({
      success: true,
      approval: {
        org_id,
        approval_type,
        plan_id,
        step_index,
        decision,
        verified_by: verifiedName,
        verified_identity: verifiedIdentity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Action Approve] Error:", error);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
