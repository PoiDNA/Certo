import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

/**
 * POST /api/olympiad/links — Generate a cohort link
 * GET /api/olympiad/links?org_id=xxx — List cohort links for an org
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, tenant_id, group_id, cohort_name, max_uses } = body;

    if (!tenant_id || !group_id || !cohort_name || !max_uses) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const linkHash = generateLinkHash();
    const baseUrl = req.headers.get("origin") || "https://certogov.org";
    const surveyUrl = `${baseUrl}/pl/olympiad/${tenant_id}/survey?group=${group_id}&link=${linkHash}`;

    const whatsappMsg = {
      pl: `Drodzy Rodzice! Bierzemy udział w Olimpiadzie Certo. Odpowiedzcie na 5 pytań, zajmie to minutę! 👉 ${surveyUrl}`,
      en: `Dear Parents! We're in the Certo Olympiad. Answer 5 questions, it takes 1 minute! 👉 ${surveyUrl}`,
    };

    const supabase = getOlympiadSupabase();
    if (supabase && org_id) {
      const { error } = await supabase.from("olympiad_cohort_links").insert({
        link_hash: linkHash,
        org_id,
        tenant_id,
        group_id,
        cohort_name,
        max_uses,
        current_uses: 0,
        whatsapp_msg: whatsappMsg,
        velocity_anomaly: false,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days
      });

      if (error) {
        console.error("[Olympiad Links] Supabase error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      link_hash: linkHash,
      url: surveyUrl,
      whatsapp_msg: whatsappMsg,
      max_uses,
      persisted: !!supabase,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");

  const supabase = getOlympiadSupabase();
  if (!supabase || !orgId) {
    return NextResponse.json({ links: [] });
  }

  try {
    const { data, error } = await supabase
      .from("olympiad_cohort_links")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Olympiad Links] Error:", error);
      return NextResponse.json({ links: [] });
    }

    return NextResponse.json({ links: data || [] });
  } catch {
    return NextResponse.json({ links: [] });
  }
}

function generateLinkHash(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let hash = "";
  for (let i = 0; i < 8; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
