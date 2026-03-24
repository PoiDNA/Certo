"use client";

import { useState, useEffect } from "react";

interface AdminPanelProps {
  locale: string;
  userId: string;
}

interface TenantRow {
  tenant_id: string;
  tenant_slug: string;
  tenant_name: Record<string, string>;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

interface RoleRow {
  role_id: string;
  role_name: Record<string, string>;
  role_group: string;
  tenant_id: string | null;
}

interface UserRoleRow {
  id: string;
  user_id: string;
  role_id: string;
  org_id: string | null;
  granted_at: string;
  is_active: boolean;
  user_email?: string;
}

type Tab = "tenants" | "roles" | "users";

export default function AdminPanel({ locale, userId }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("tenants");
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<string | null>(null);
  const [configJson, setConfigJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [grantForm, setGrantForm] = useState({ email: "", roleId: "" });

  const isPl = locale === "pl";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/olympiad/admin/data");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
        setRoles(data.roles || []);
        setUserRoles(data.userRoles || []);
      }
    } catch (e) {
      console.error("[Admin] Fetch error:", e);
    }
    setLoading(false);
  }

  function handleEditConfig(tenant: TenantRow) {
    setEditingTenant(tenant.tenant_id);
    setConfigJson(JSON.stringify(tenant.config, null, 2));
    setJsonError(null);
  }

  async function handleSaveConfig() {
    if (!editingTenant) return;
    try {
      JSON.parse(configJson);
      setJsonError(null);
    } catch {
      setJsonError(isPl ? "Nieprawidłowy JSON" : "Invalid JSON");
      return;
    }

    const res = await fetch("/api/olympiad/admin/tenant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: editingTenant,
        config: JSON.parse(configJson),
      }),
    });

    if (res.ok) {
      setEditingTenant(null);
      fetchData();
    }
  }

  async function handleToggleTenant(tenantId: string, isActive: boolean) {
    await fetch("/api/olympiad/admin/tenant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant_id: tenantId, is_active: !isActive }),
    });
    fetchData();
  }

  async function handleGrantRole() {
    if (!grantForm.email || !grantForm.roleId) return;
    const res = await fetch("/api/olympiad/admin/grant-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: grantForm.email,
        role_id: grantForm.roleId,
        granted_by: userId,
      }),
    });
    if (res.ok) {
      setGrantForm({ email: "", roleId: "" });
      fetchData();
    }
  }

  async function handleRevokeRole(userRoleId: string) {
    await fetch("/api/olympiad/admin/grant-role", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_role_id: userRoleId }),
    });
    fetchData();
  }

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-certo-gold text-white"
        : "text-certo-navy/60 dark:text-certo-dark-muted hover:bg-gray-100 dark:hover:bg-certo-dark-surface"
    }`;

  const inputClass =
    "block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-certo-gold/50";

  if (loading) {
    return (
      <div className="text-center py-20 text-certo-navy/40 dark:text-certo-dark-muted">
        {isPl ? "Ładowanie..." : "Loading..."}
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button className={tabClass("tenants")} onClick={() => setActiveTab("tenants")}>
          {isPl ? "Tenanty" : "Tenants"} ({tenants.length})
        </button>
        <button className={tabClass("roles")} onClick={() => setActiveTab("roles")}>
          {isPl ? "Role" : "Roles"} ({roles.length})
        </button>
        <button className={tabClass("users")} onClick={() => setActiveTab("users")}>
          {isPl ? "Przypisania ról" : "Role assignments"} ({userRoles.length})
        </button>
      </div>

      {/* TAB: Tenants */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <div
              key={tenant.tenant_id}
              className="p-6 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {tenant.tenant_name[locale] || tenant.tenant_name.pl || tenant.tenant_id}
                  </h3>
                  <span className="text-xs font-mono text-certo-navy/40 dark:text-certo-dark-muted">
                    {tenant.tenant_id} / {tenant.tenant_slug}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTenant(tenant.tenant_id, tenant.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tenant.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {tenant.is_active ? (isPl ? "Aktywny" : "Active") : (isPl ? "Nieaktywny" : "Inactive")}
                  </button>
                  <button
                    onClick={() =>
                      editingTenant === tenant.tenant_id
                        ? setEditingTenant(null)
                        : handleEditConfig(tenant)
                    }
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-certo-navy/5 dark:bg-certo-dark-border hover:bg-certo-navy/10"
                  >
                    {editingTenant === tenant.tenant_id ? "✕" : (isPl ? "Edytuj config" : "Edit config")}
                  </button>
                </div>
              </div>

              {/* Config JSONB editor */}
              {editingTenant === tenant.tenant_id && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={configJson}
                    onChange={(e) => {
                      setConfigJson(e.target.value);
                      setJsonError(null);
                    }}
                    rows={20}
                    className="w-full font-mono text-xs p-4 rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-certo-navy/5 dark:bg-certo-dark-surface focus:outline-none focus:ring-2 focus:ring-certo-gold/50"
                    spellCheck={false}
                  />
                  {jsonError && (
                    <p className="text-red-500 text-xs">{jsonError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-2 bg-certo-gold text-white text-sm font-bold rounded-lg hover:bg-certo-gold-light"
                    >
                      {isPl ? "Zapisz" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingTenant(null)}
                      className="px-4 py-2 text-sm rounded-lg border border-certo-navy/20 dark:border-certo-dark-border"
                    >
                      {isPl ? "Anuluj" : "Cancel"}
                    </button>
                  </div>
                </div>
              )}

              {/* Config summary */}
              {editingTenant !== tenant.tenant_id && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-certo-navy/5 dark:bg-certo-dark-border">
                    <span className="text-certo-navy/40 dark:text-certo-dark-muted">
                      {isPl ? "Grupy ankietowe" : "Survey groups"}
                    </span>
                    <div className="font-semibold mt-1">
                      {(tenant.config?.survey_groups as unknown[])?.length || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-certo-navy/5 dark:bg-certo-dark-border">
                    <span className="text-certo-navy/40 dark:text-certo-dark-muted">
                      {isPl ? "Filary" : "Pillars"}
                    </span>
                    <div className="font-semibold mt-1">
                      {(tenant.config?.pillars as unknown[])?.length || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-certo-navy/5 dark:bg-certo-dark-border">
                    <span className="text-certo-navy/40 dark:text-certo-dark-muted">
                      {isPl ? "Test" : "Test"}
                    </span>
                    <div className="font-semibold mt-1">
                      {String((tenant.config?.knowledge_test as Record<string, unknown>)?.num_questions ?? "—")} {isPl ? "pytań" : "questions"}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-certo-navy/5 dark:bg-certo-dark-border">
                    <span className="text-certo-navy/40 dark:text-certo-dark-muted">
                      {isPl ? "Domeny" : "Domains"}
                    </span>
                    <div className="font-semibold mt-1">
                      {(tenant.config?.custom_domains as string[])?.join(", ") || "—"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {tenants.length === 0 && (
            <p className="text-center text-certo-navy/40 dark:text-certo-dark-muted py-10">
              {isPl ? "Brak tenantów w Supabase. Użyj statycznej konfiguracji." : "No tenants in Supabase. Using static config."}
            </p>
          )}
        </div>
      )}

      {/* TAB: Roles */}
      {activeTab === "roles" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-certo-navy/40 dark:text-certo-dark-muted border-b border-certo-navy/10 dark:border-certo-dark-border">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">{isPl ? "Nazwa" : "Name"}</th>
                <th className="pb-2 pr-4">{isPl ? "Grupa" : "Group"}</th>
                <th className="pb-2 pr-4">Tenant</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.role_id}
                  className="border-b border-certo-navy/5 dark:border-certo-dark-border"
                >
                  <td className="py-2 pr-4 font-mono text-xs">{role.role_id}</td>
                  <td className="py-2 pr-4">{role.role_name[locale] || role.role_name.pl}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        role.role_group === "platform"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                          : role.role_group === "olympiad"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      }`}
                    >
                      {role.role_group}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                    {role.tenant_id || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: User Role Assignments */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Grant role form */}
          <div className="p-6 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface">
            <h3 className="font-semibold mb-3">
              {isPl ? "Nadaj rolę" : "Grant role"}
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">Email</label>
                <input
                  type="email"
                  value={grantForm.email}
                  onChange={(e) => setGrantForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.com"
                  className={inputClass}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                  {isPl ? "Rola" : "Role"}
                </label>
                <select
                  value={grantForm.roleId}
                  onChange={(e) => setGrantForm((p) => ({ ...p, roleId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">{isPl ? "Wybierz rolę..." : "Select role..."}</option>
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.role_name[locale] || r.role_name.pl} ({r.role_id})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGrantRole}
                disabled={!grantForm.email || !grantForm.roleId}
                className="px-4 py-2 bg-certo-gold text-white text-sm font-bold rounded-lg hover:bg-certo-gold-light disabled:opacity-50"
              >
                {isPl ? "Nadaj" : "Grant"}
              </button>
            </div>
          </div>

          {/* Current assignments */}
          {userRoles.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-certo-navy/40 dark:text-certo-dark-muted border-b border-certo-navy/10 dark:border-certo-dark-border">
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">{isPl ? "Rola" : "Role"}</th>
                  <th className="pb-2 pr-4">{isPl ? "Nadana" : "Granted"}</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {userRoles.map((ur) => (
                  <tr key={ur.id} className="border-b border-certo-navy/5 dark:border-certo-dark-border">
                    <td className="py-2 pr-4 text-xs">{ur.user_email || ur.user_id.slice(0, 8)}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{ur.role_id}</td>
                    <td className="py-2 pr-4 text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                      {new Date(ur.granted_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleRevokeRole(ur.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        {isPl ? "Cofnij" : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-certo-navy/40 dark:text-certo-dark-muted py-10">
              {isPl ? "Brak przypisanych ról" : "No role assignments"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
