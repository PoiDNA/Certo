import { NextRequest, NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../../lib/olympiad/supabase";

/**
 * PUT /api/olympiad/admin/tenant
 *
 * Update tenant config or is_active status.
 * Body: { tenant_id, config?, is_active? }
 */
export async function PUT(req: NextRequest) {
  const supabase = getOlympiadSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { tenant_id, config, is_active } = body;

    if (!tenant_id) {
      return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (config !== undefined) updates.config = config;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("olympiad_tenants")
      .update(updates)
      .eq("tenant_id", tenant_id);

    if (error) {
      console.error("[Admin Tenant] Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin Tenant] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
