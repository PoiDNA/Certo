import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../lib/olympiad/supabase";

/**
 * POST /api/olympiad/register
 *
 * Register an organization for the Certo Olympiad.
 * Writes to olympiad_organizations via Supabase service role.
 * Falls back to log-only if Supabase is unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenant_id,
      org_name,
      country,
      municipality,
      coordinator_name,
      coordinator_email,
      coordinator_phone,
      team_members,
      declared_population,
      director_declaration,
    } = body;

    // Validation
    if (!tenant_id || !org_name || !country) {
      return NextResponse.json(
        { error: "Missing required fields: tenant_id, org_name, country" },
        { status: 400 }
      );
    }

    if (!coordinator_name || !coordinator_email) {
      return NextResponse.json(
        { error: "Coordinator name and email are required" },
        { status: 400 }
      );
    }

    if (!director_declaration) {
      return NextResponse.json(
        { error: "Director declaration is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(coordinator_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Try Supabase write
    const supabase = getOlympiadSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("olympiad_organizations")
        .insert({
          tenant_id,
          org_name,
          country,
          municipality: municipality || null,
          coordinator_id: null, // no auth user yet
          team_members: team_members || [],
          declared_population: declared_population || {},
          director_declaration: `signed:${coordinator_email}:${new Date().toISOString()}`,
        })
        .select("org_id")
        .single();

      if (error) {
        console.error("[Olympiad Register] Supabase error:", error);
        // Fall through to fallback
      } else {
        console.log("[Olympiad Register] Saved to DB:", data.org_id);
        return NextResponse.json({
          success: true,
          org_id: data.org_id,
          message: "Organization registered successfully",
          persisted: true,
        });
      }
    }

    // Fallback: log and return mock ID
    const org_id = crypto.randomUUID();
    console.log("[Olympiad Register] Fallback (no DB):", {
      org_id,
      tenant_id,
      org_name,
      country,
      coordinator: `${coordinator_name} <${coordinator_email}>`,
    });

    return NextResponse.json({
      success: true,
      org_id,
      message: "Organization registered successfully",
      persisted: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
