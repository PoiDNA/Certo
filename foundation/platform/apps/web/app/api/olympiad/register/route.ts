import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/olympiad/register
 *
 * Register an organization for the Certo Olympiad.
 * In production: validates + writes to olympiad_organizations via service role.
 * For MVP: validates and logs.
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(coordinator_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // TODO: Cloudflare Turnstile verification
    // TODO: Write to Supabase via service role
    // const supabase = getServiceSupabase();
    // const { data, error } = await supabase.from("olympiad_organizations").insert({ ... });

    console.log("[Olympiad Register]", {
      tenant_id,
      org_name,
      country,
      municipality,
      coordinator: `${coordinator_name} <${coordinator_email}>`,
      team_size: team_members?.length || 0,
      declared_population,
      director_declaration,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      org_id: crypto.randomUUID(),
      message: "Organization registered successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
