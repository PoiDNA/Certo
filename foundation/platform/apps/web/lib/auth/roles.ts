import { createClient } from "@supabase/supabase-js";

/**
 * Role system for Certo platform.
 *
 * Platform roles (Fundacja):
 *   admin, certo-zarzad, certo-izba-nadzoru, certo-rada,
 *   certo-kolegium, certo-trybunal, certo-centrum
 *
 * Olympiad roles (per tenant):
 *   olympiad-{tenant}-coordinator, olympiad-{tenant}-jury,
 *   olympiad-{tenant}-observer, olympiad-{tenant}-auditor
 *
 * Consulting:
 *   advisor
 */

export interface UserRole {
  role_id: string;
  role_name: Record<string, string>;
  role_group: string;
  org_id: string | null;
}

/**
 * Get roles for a user via service role client.
 * Use in API routes (server-side only).
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      role_id,
      org_id,
      roles!inner(role_name, role_group)
    `)
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => {
    const role = row.roles as Record<string, unknown>;
    return {
      role_id: row.role_id as string,
      role_name: (role?.role_name || {}) as Record<string, string>,
      role_group: (role?.role_group || "") as string,
      org_id: (row.org_id || null) as string | null,
    };
  });
}

/**
 * Check if a user has a specific role.
 */
export async function userHasRole(
  userId: string,
  roleId: string
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.some((r) => r.role_id === roleId);
}

/**
 * Check if a user has any of the specified roles.
 */
export async function userHasAnyRole(
  userId: string,
  roleIds: string[]
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.some((r) => roleIds.includes(r.role_id));
}

/**
 * Check if user is platform admin (admin or certo-zarzad or certo-centrum).
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return userHasAnyRole(userId, ["admin", "certo-zarzad", "certo-centrum"]);
}

/**
 * Check if user is olympiad coordinator for a specific tenant.
 */
export async function isOlympiadCoordinator(
  userId: string,
  tenantId: string,
  orgId?: string
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  const roleId = `olympiad-${tenantId}-coordinator`;
  return roles.some(
    (r) =>
      r.role_id === roleId && (!orgId || r.org_id === orgId || r.org_id === null)
  );
}

/**
 * Grant a role to a user (service role only).
 */
export async function grantRole(
  userId: string,
  roleId: string,
  grantedBy: string,
  orgId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false, error: "No Supabase client" };

  const { error } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role_id: roleId,
      org_id: orgId || null,
      granted_by: grantedBy,
      is_active: true,
    },
    { onConflict: "user_id,role_id,org_id" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Revoke a role from a user (soft delete).
 */
export async function revokeRole(
  userId: string,
  roleId: string,
  orgId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false, error: "No Supabase client" };

  let query = supabase
    .from("user_roles")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("role_id", roleId);

  if (orgId) {
    query = query.eq("org_id", orgId);
  }

  const { error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// -- Internal --

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
