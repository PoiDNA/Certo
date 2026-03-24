import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";
import { tenantConfigSchema } from "../../../../lib/olympiad/types";
import { calculateCertoScore } from "../../../../lib/olympiad/scoring";

/**
 * GET /api/olympiad/results?org_id=xxx
 *
 * Calculate and return Certo Score for an organization from real survey data.
 * Falls back to demo data if Supabase unavailable or no responses found.
 */
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");

  const supabase = getOlympiadSupabase();
  if (!supabase || !orgId) {
    return NextResponse.json({ source: "demo", data: getDemoResults() });
  }

  try {
    // Get organization
    const { data: org, error: orgError } = await supabase
      .from("olympiad_organizations")
      .select("org_id, org_name, tenant_id, declared_population")
      .eq("org_id", orgId)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ source: "demo", data: getDemoResults() });
    }

    // Get tenant config
    const { data: tenant, error: tenantError } = await supabase
      .from("olympiad_tenants")
      .select("config")
      .eq("tenant_id", org.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ source: "demo", data: getDemoResults() });
    }

    const configParsed = tenantConfigSchema.safeParse(
      (tenant as { config: unknown }).config
    );
    if (!configParsed.success) {
      return NextResponse.json({ source: "demo", data: getDemoResults() });
    }
    const config = configParsed.data;

    // Get all survey responses for this org
    const { data: responses, error: respError } = await supabase
      .from("olympiad_survey_responses")
      .select("group_id, pillar_scores")
      .eq("org_id", orgId);

    if (respError || !responses || responses.length === 0) {
      return NextResponse.json({ source: "demo", data: getDemoResults() });
    }

    // Aggregate responses per pillar
    const pillarResponses: Record<string, number[]> = {};
    const groupCounts: Record<string, number> = {};

    for (const resp of responses) {
      const scores = resp.pillar_scores as Record<string, number>;
      const groupId = resp.group_id;
      groupCounts[groupId] = (groupCounts[groupId] || 0) + 1;

      for (const [pillarId, score] of Object.entries(scores)) {
        if (!pillarResponses[pillarId]) pillarResponses[pillarId] = [];
        pillarResponses[pillarId].push(score);
      }
    }

    // Build participation data
    const declaredPop = (org.declared_population || {}) as Record<
      string,
      number
    >;
    const participation = config.survey_groups.map((g) => ({
      groupId: g.group_id,
      respondents: groupCounts[g.group_id] || 0,
      declaredPopulation: declaredPop[g.group_id] || 0,
    }));

    // Calculate score
    const result = calculateCertoScore(pillarResponses, participation, config);

    return NextResponse.json({
      source: "live",
      data: {
        org_name: org.org_name,
        certo_score: result.certoScore,
        certo_vector: result.certoVector,
        pillar_scores: result.pillarScores,
        participation_rates: result.participationRates,
        community_bonus: result.communityBonus,
        k_anonymity_suppressed: result.kAnonymitySuppressed,
        achievement_level: result.achievementLevel,
        total_responses: responses.length,
      },
    });
  } catch (e) {
    console.error("[Olympiad Results] Error:", e);
    return NextResponse.json({ source: "demo", data: getDemoResults() });
  }
}

function getDemoResults() {
  return {
    org_name: "Szkoła Podstawowa nr 7 im. Marii Curie",
    certo_score: 74,
    certo_vector: "+",
    pillar_scores: {
      operational: 78,
      stakeholders: 71,
      decisions: 68,
      stability: 82,
      transparency: 69,
    },
    participation_rates: {
      students: 65,
      teachers: 88,
      parents: 22,
      staff: 45,
    },
    community_bonus: 2,
    k_anonymity_suppressed: 0,
    achievement_level: "SILVER",
    total_responses: 312,
  };
}
