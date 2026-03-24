import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../../lib/olympiad/supabase";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/olympiad/action/evaluate
 *
 * LLM pre-filter for Certo Action submissions.
 * Uses Anthropic Claude API to evaluate feasibility and provide feedback.
 *
 * Body: { org_id, tenant_id, action_plan }
 * Returns: { score: 0-100, feedback_reason: string, top_5_pct: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, tenant_id, action_plan } = body;

    if (!action_plan) {
      return NextResponse.json({ error: "Missing action_plan" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: no API key, return mock evaluation
      return NextResponse.json({
        score: 70,
        feedback_reason: "Automatyczna ocena niedostępna — brak klucza API. Plan zostanie oceniony przez peer-review.",
        top_5_pct: false,
        source: "mock",
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const { what_to_change, steps, success_metrics, weakest_pillar, template_used } = action_plan;

    const prompt = `You are an expert governance evaluator for the Certo Olympiad — an educational program that teaches organizations about good governance.

Evaluate this Certo Action (improvement plan) submitted by an organization. Rate it on a 0-100 scale and provide brief, constructive feedback.

## Certo Action details:
- **Weakest pillar**: ${weakest_pillar || "not specified"}
- **Template used**: ${template_used || "custom plan"}
- **What they want to change**: ${what_to_change || "not specified"}
- **Steps**: ${Array.isArray(steps) ? steps.join("; ") : steps || "none"}
- **Success metrics**: ${Array.isArray(success_metrics) ? success_metrics.join("; ") : success_metrics || "none"}

## Evaluation criteria:
1. **Clarity** (0-25): Is the plan clear and understandable?
2. **Concreteness** (0-25): Are the steps specific and actionable (not vague)?
3. **Measurability** (0-25): Are the success metrics quantifiable?
4. **Feasibility** (0-25): Is this realistic for the organization to implement?

## Response format (JSON only):
{
  "score": <0-100>,
  "clarity": <0-25>,
  "concreteness": <0-25>,
  "measurability": <0-25>,
  "feasibility": <0-25>,
  "feedback_reason": "<2-3 sentences of constructive feedback in the same language as the action plan. Be encouraging but honest. If something is missing, say what specifically.>"
}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    // Parse response
    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    let evaluation: {
      score: number;
      clarity: number;
      concreteness: number;
      measurability: number;
      feasibility: number;
      feedback_reason: string;
    };

    try {
      // Extract JSON from response (may have markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      return NextResponse.json({
        score: 60,
        feedback_reason: "Ocena automatyczna nie powiodła się. Plan zostanie oceniony przez peer-review.",
        top_5_pct: false,
        source: "parse-error",
      });
    }

    const top5pct = evaluation.score >= 90;

    // Save to DB if available
    const supabase = getOlympiadSupabase();
    if (supabase && org_id) {
      await supabase
        .from("olympiad_actions")
        .update({
          llm_prefilter_score: evaluation.score,
          llm_feedback_reason: evaluation.feedback_reason,
        })
        .eq("org_id", org_id)
        .eq("tenant_id", tenant_id || "schools");
    }

    return NextResponse.json({
      score: evaluation.score,
      clarity: evaluation.clarity,
      concreteness: evaluation.concreteness,
      measurability: evaluation.measurability,
      feasibility: evaluation.feasibility,
      feedback_reason: evaluation.feedback_reason,
      top_5_pct: top5pct,
      source: "anthropic",
    });
  } catch (e) {
    console.error("[Action Evaluate] Error:", e);
    return NextResponse.json(
      { error: "Evaluation failed", score: 0 },
      { status: 500 }
    );
  }
}
