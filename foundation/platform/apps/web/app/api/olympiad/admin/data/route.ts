import { NextResponse } from "next/server";
import { getOlympiadSupabase } from "../../../../../lib/olympiad/supabase";

/**
 * GET /api/olympiad/admin/data
 *
 * Returns tenants, roles, and user role assignments for admin panel.
 * TODO: Add auth check (admin role required).
 */
export async function GET() {
  const supabase = getOlympiadSupabase();

  if (!supabase) {
    return NextResponse.json({
      tenants: [],
      roles: [],
      userRoles: [],
      source: "no-supabase",
    });
  }

  try {
    const [tenantsRes, rolesRes, userRolesRes] = await Promise.all([
      supabase.from("olympiad_tenants").select("*").order("created_at"),
      supabase.from("roles").select("role_id, role_name, role_group, tenant_id").order("sort_order"),
      supabase
        .from("user_roles")
        .select("id, user_id, role_id, org_id, granted_at, is_active")
        .eq("is_active", true)
        .order("granted_at", { ascending: false })
        .limit(100),
    ]);

    // Enrich user_roles with emails from profiles
    let enrichedUserRoles = userRolesRes.data || [];
    if (enrichedUserRoles.length > 0) {
      const userIds = [...new Set(enrichedUserRoles.map((ur) => ur.user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, email")
        .in("id", userIds);

      const emailMap = new Map(
        (profiles || []).map((p: { id: string; email: string }) => [p.id, p.email])
      );
      enrichedUserRoles = enrichedUserRoles.map((ur) => ({
        ...ur,
        user_email: emailMap.get(ur.user_id) || null,
      }));
    }

    return NextResponse.json({
      tenants: tenantsRes.data || [],
      roles: rolesRes.data || [],
      userRoles: enrichedUserRoles,
      source: "supabase",
    });
  } catch (e) {
    console.error("[Admin Data] Error:", e);
    return NextResponse.json(
      { tenants: [], roles: [], userRoles: [], error: "Fetch failed" },
      { status: 500 }
    );
  }
}
