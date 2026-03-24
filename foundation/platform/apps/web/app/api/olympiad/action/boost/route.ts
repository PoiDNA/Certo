import { NextRequest, NextResponse } from "next/server";
import { calculateActionBoost, type ActionBoostInput } from "../../../../../lib/olympiad/scoring";
import { getOlympiadSupabase } from "../../../../../lib/olympiad/supabase";
import { SCHOOLS_CONFIG } from "../../../../../lib/olympiad/tenants/schools";

/**
 * POST /api/olympiad/action/boost
 *
 * Calculate and apply rating boost after completing Certo Action.
 * Called when coordinator marks all steps as "completed" with proof.
 *
 * Body: { org_id, tenant_id }
 * Returns: ActionBoostResult + approval status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, tenant_id } = body;

    if (!org_id || !tenant_id) {
      return NextResponse.json({ error: "Missing org_id or tenant_id" }, { status: 400 });
    }

    // Get current rating
    const supabase = getOlympiadSupabase();
    let currentScore = 0;
    let currentLevel: string | null = null;
    let pillarScores: Record<string, number> = {};
    let weakestPillar = "";
    let weakestPillarScore = 100;
    let peerReviewAvg: number | null = null;
    let llmScore: number | null = null;
    let allStepsCompleted = false;
    let allStepsHaveProof = false;
    let stepsCount = 0;
    let completedStepsCount = 0;

    if (supabase) {
      // Fetch current rating
      const { data: rating } = await supabase
        .from("olympiad_org_ratings")
        .select("*")
        .eq("org_id", org_id)
        .single();

      if (rating) {
        currentScore = rating.certo_score;
        pillarScores = rating.pillar_scores || {};
      }

      // Fetch achievement
      const { data: achievement } = await supabase
        .from("olympiad_achievements")
        .select("level")
        .eq("org_id", org_id)
        .single();

      currentLevel = achievement?.level || null;

      // Fetch action (steps, peer review, LLM)
      const { data: action } = await supabase
        .from("olympiad_actions")
        .select("*")
        .eq("org_id", org_id)
        .single();

      if (action) {
        weakestPillar = action.weakest_pillar || "";
        peerReviewAvg = action.peer_review_avg;
        llmScore = action.llm_prefilter_score;

        // Parse steps to check completion
        const steps = action.steps || [];
        stepsCount = steps.length;
        completedStepsCount = steps.filter(
          (s: { status?: string }) => s.status === "completed"
        ).length;
        allStepsCompleted = stepsCount > 0 && completedStepsCount === stepsCount;
        allStepsHaveProof = steps.every(
          (s: { proof?: string; status?: string }) =>
            s.status !== "completed" || (s.proof && s.proof.trim().length > 0)
        );
      }

      weakestPillarScore = pillarScores[weakestPillar] ?? 50;
    } else {
      // Demo mode
      currentScore = 78;
      currentLevel = "silver";
      pillarScores = { operational: 82, stakeholders: 71, decisions: 80, stability: 75, transparency: 68 };
      weakestPillar = "transparency";
      weakestPillarScore = 68;
      peerReviewAvg = 4.2;
      llmScore = 75;
      allStepsCompleted = true;
      allStepsHaveProof = true;
      stepsCount = 3;
      completedStepsCount = 3;
    }

    // Use tenant config (default to schools)
    const config = SCHOOLS_CONFIG;

    const boostInput: ActionBoostInput = {
      currentScore,
      currentLevel: currentLevel as any,
      weakestPillar,
      weakestPillarScore,
      allStepsCompleted,
      allStepsHaveProof,
      peerReviewAvg,
      llmScore,
      stepsCount,
      completedStepsCount,
    };

    const result = calculateActionBoost(boostInput, config);

    // If eligible and automatic approval, apply immediately
    if (result.eligible && result.approvalRequired === "automatic" && supabase) {
      // Update rating
      const newPillarScores = { ...pillarScores, [weakestPillar]: result.newPillarScore };
      await supabase
        .from("olympiad_org_ratings")
        .upsert({
          org_id,
          tenant_id,
          pillar_scores: newPillarScores,
          certo_score: result.newCertoScore,
          certo_vector: result.newLevel ? "++" : "+",
        });

      // Update achievement if changed
      if (result.levelChanged && result.newLevel) {
        await supabase
          .from("olympiad_achievements")
          .upsert({ org_id, tenant_id, level: result.newLevel, awarded_at: new Date().toISOString() });
      }

      // Record history
      await supabase.from("olympiad_rating_history").insert({
        org_id,
        tenant_id,
        previous_score: currentScore,
        previous_level: currentLevel,
        previous_pillar_scores: pillarScores,
        new_score: result.newCertoScore,
        new_level: result.newLevel,
        new_pillar_scores: newPillarScores,
        new_vector: "+",
        trigger_type: "action_completion",
        weakest_pillar: weakestPillar,
        pillar_boost: result.pillarBoost,
        peer_review_avg: peerReviewAvg,
        llm_score: llmScore,
        approval_status: "auto_approved",
        approval_required: "automatic",
      });
    } else if (result.eligible && result.approvalRequired !== "automatic" && supabase) {
      // Create pending approval request
      await supabase.from("olympiad_rating_history").insert({
        org_id,
        tenant_id,
        previous_score: currentScore,
        previous_level: currentLevel,
        previous_pillar_scores: pillarScores,
        new_score: result.newCertoScore,
        new_level: result.newLevel,
        new_pillar_scores: { ...pillarScores, [weakestPillar]: result.newPillarScore },
        trigger_type: "action_completion",
        weakest_pillar: weakestPillar,
        pillar_boost: result.pillarBoost,
        peer_review_avg: peerReviewAvg,
        llm_score: llmScore,
        approval_status: "pending",
        approval_required: result.approvalRequired,
      });
    }

    return NextResponse.json({
      success: true,
      boost: result,
      current: { score: currentScore, level: currentLevel, pillarScores },
    });
  } catch (error) {
    console.error("[Action Boost] Error:", error);
    return NextResponse.json({ error: "Failed to calculate boost" }, { status: 500 });
  }
}
