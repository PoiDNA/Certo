import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

/**
 * GET /api/olympiad/participation?tenant_id=schools&org_id=xxx
 *
 * Returns real participation rates per survey group for an organization.
 * Falls back to demo data if Supabase unavailable.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id");
  const orgId = searchParams.get("org_id");

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenant_id" },
      { status: 400 }
    );
  }

  const supabase = getOlympiadSupabase();

  if (supabase && orgId) {
    try {
      // Count responses per group
      const { data: responses, error } = await supabase
        .from("olympiad_survey_responses")
        .select("group_id")
        .eq("tenant_id", tenantId)
        .eq("org_id", orgId);

      if (!error && responses) {
        const counts: Record<string, number> = {};
        for (const r of responses) {
          counts[r.group_id] = (counts[r.group_id] || 0) + 1;
        }

        // Get declared population from org
        const { data: org } = await supabase
          .from("olympiad_organizations")
          .select("declared_population")
          .eq("org_id", orgId)
          .single();

        const declared = org?.declared_population || {};
        const participation: Record<string, { count: number; total: number; pct: number }> = {};

        for (const [groupId, count] of Object.entries(counts)) {
          const total = (declared as Record<string, number>)[groupId] || 0;
          participation[groupId] = {
            count: count as number,
            total,
            pct: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
          };
        }

        // Check for velocity anomalies on cohort links
        const { data: anomalyLinks } = await supabase
          .from("olympiad_cohort_links")
          .select("link_hash, group_id, cohort_name, velocity_anomaly")
          .eq("org_id", orgId)
          .eq("velocity_anomaly", true);

        return NextResponse.json({
          source: "supabase",
          participation,
          total_responses: responses.length,
          anomaly_links: anomalyLinks || [],
        });
      }
    } catch (e) {
      console.error("[Participation] Supabase error:", e);
    }
  }

  // Fallback: demo data
  return NextResponse.json({
    source: "demo",
    participation: {
      students: { count: 142, total: 200, pct: 71 },
      teachers: { count: 38, total: 45, pct: 84 },
      parents: { count: 67, total: 200, pct: 34 },
      staff: { count: 8, total: 12, pct: 67 },
    },
    total_responses: 255,
    anomaly_links: [],
  });
}
