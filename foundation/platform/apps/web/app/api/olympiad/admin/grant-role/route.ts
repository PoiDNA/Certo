import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../../lib/olympiad/supabase";

/**
 * POST /api/olympiad/admin/grant-role
 * Body: { email, role_id, granted_by, org_id? }
 *
 * DELETE /api/olympiad/admin/grant-role
 * Body: { user_role_id }
 */
export async function POST(req: NextRequest) {
  const supabase = getOlympiadSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const { email, role_id, granted_by, org_id } = await req.json();

    if (!email || !role_id) {
      return NextResponse.json({ error: "Missing email or role_id" }, { status: 400 });
    }

    // Find user by email in profiles
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: `User not found: ${email}` },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("user_roles").upsert(
      {
        user_id: profile.id,
        role_id,
        org_id: org_id || null,
        granted_by: granted_by || null,
        is_active: true,
      },
      { onConflict: "user_id,role_id,org_id" }
    );

    if (error) {
      console.error("[Grant Role] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user_id: profile.id });
  } catch (e) {
    console.error("[Grant Role] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getOlympiadSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const { user_role_id } = await req.json();

    if (!user_role_id) {
      return NextResponse.json({ error: "Missing user_role_id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_roles")
      .update({ is_active: false })
      .eq("id", user_role_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Revoke Role] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
