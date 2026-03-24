"use client";

import { useState, useCallback, useEffect } from "react";
import type { TenantConfig } from "../../lib/olympiad/types";
import { Link } from "../../i18n-config";

interface CoordinatorDashboardProps {
  config: TenantConfig;
  locale: string;
  tenantSlug: string;
  orgId?: string;
}

interface CohortLink {
  id: string;
  groupId: string;
  groupName: string;
  cohortName: string;
  maxUses: number;
  currentUses: number;
  url: string;
  whatsappMsg: string;
  createdAt: string;
}

interface ParticipationData {
  [groupId: string]: { count: number; total: number; pct: number };
}

// Demo participation data (fallback)
const DEMO_PARTICIPATION: ParticipationData = {
  students: { count: 292, total: 450, pct: 65 },
  teachers: { count: 31, total: 35, pct: 89 },
  parents: { count: 176, total: 800, pct: 22 },
  staff: { count: 9, total: 20, pct: 45 },
};

export default function CoordinatorDashboard({
  config,
  locale,
  tenantSlug,
  orgId,
}: CoordinatorDashboardProps) {
  const [links, setLinks] = useState<CohortLink[]>([]);
  const [generating, setGenerating] = useState(false);
  const [newCohort, setNewCohort] = useState({ groupId: "", name: "", maxUses: 30 });
  const [participation, setParticipation] = useState<ParticipationData>(DEMO_PARTICIPATION);
  const [anomalyLinks, setAnomalyLinks] = useState<{ link_hash: string; group_id: string; cohort_name: string }[]>([]);
  const [dataSource, setDataSource] = useState<"demo" | "supabase">("demo");

  // Fetch real participation data
  useEffect(() => {
    async function fetchParticipation() {
      try {
        const params = new URLSearchParams({ tenant_id: tenantSlug });
        if (orgId) params.set("org_id", orgId);
        const res = await fetch(`/api/olympiad/participation?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.participation && Object.keys(data.participation).length > 0) {
            setParticipation(data.participation);
            setDataSource(data.source);
          }
          if (data.anomaly_links) {
            setAnomalyLinks(data.anomaly_links);
          }
        }
      } catch {
        // Keep demo data on error
      }
    }
    fetchParticipation();
  }, [tenantSlug, orgId]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"links" | "participation" | "phases">("links");

  const isPl = locale === "pl";
  const t = useCallback(
    (key: Record<string, string>) =>
      key[locale] || key.en || key.pl || Object.values(key)[0] || "",
    [locale]
  );

  async function generateLink() {
    if (!newCohort.groupId || !newCohort.name) return;
    setGenerating(true);

    const group = config.survey_groups.find((g) => g.group_id === newCohort.groupId);

    try {
      const res = await fetch("/api/olympiad/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId || null,
          tenant_id: tenantSlug,
          group_id: newCohort.groupId,
          cohort_name: newCohort.name,
          max_uses: newCohort.maxUses,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const link: CohortLink = {
          id: data.link_hash,
          groupId: newCohort.groupId,
          groupName: t(group?.name || { pl: "—" }),
          cohortName: newCohort.name,
          maxUses: newCohort.maxUses,
          currentUses: 0,
          url: data.url,
          whatsappMsg: data.whatsapp_msg?.[locale] || data.whatsapp_msg?.pl || "",
          createdAt: new Date().toISOString(),
        };
        setLinks((prev) => [link, ...prev]);
      }
    } catch (e) {
      console.error("[CoordinatorDashboard] Link generation error:", e);
    }

    setNewCohort({ groupId: "", name: "", maxUses: 30 });
    setGenerating(false);
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const inputClass =
    "block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-certo-gold/50";
  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-certo-gold text-white"
        : "text-certo-navy/60 dark:text-certo-dark-muted hover:bg-gray-100 dark:hover:bg-certo-dark-surface"
    }`;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button className={tabClass(activeTab === "links")} onClick={() => setActiveTab("links")}>
          {isPl ? "Linki ankietowe" : "Survey links"}
        </button>
        <button className={tabClass(activeTab === "participation")} onClick={() => setActiveTab("participation")}>
          {isPl ? "Frekwencja" : "Participation"}
        </button>
        <button className={tabClass(activeTab === "phases")} onClick={() => setActiveTab("phases")}>
          {isPl ? "Fazy olimpiady" : "Olympiad phases"}
        </button>
      </div>

      {/* TAB: Links */}
      {activeTab === "links" && (
        <div>
          {/* Generate link form */}
          <div className="p-6 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface mb-6">
            <h2 className="font-bold mb-4">
              {isPl ? "Generuj link kohortowy" : "Generate cohort link"}
            </h2>
            <div className="grid gap-3 md:grid-cols-4">
              <select
                value={newCohort.groupId}
                onChange={(e) => setNewCohort((p) => ({ ...p, groupId: e.target.value }))}
                className={inputClass}
              >
                <option value="">{isPl ? "Wybierz grupę..." : "Select group..."}</option>
                {config.survey_groups.map((g) => (
                  <option key={g.group_id} value={g.group_id}>{t(g.name)}</option>
                ))}
              </select>
              <input
                type="text"
                value={newCohort.name}
                onChange={(e) => setNewCohort((p) => ({ ...p, name: e.target.value }))}
                placeholder={isPl ? "Nazwa, np. Klasa 3B" : "Name, e.g. Class 3B"}
                className={inputClass}
              />
              <input
                type="number"
                value={newCohort.maxUses}
                onChange={(e) => setNewCohort((p) => ({ ...p, maxUses: Number(e.target.value) }))}
                min={5}
                max={200}
                className={inputClass}
              />
              <button
                onClick={generateLink}
                disabled={!newCohort.groupId || !newCohort.name || generating}
                className="px-4 py-2 bg-certo-gold text-white text-sm font-bold rounded-lg hover:bg-certo-gold-light transition-colors disabled:opacity-50"
              >
                {isPl ? "Generuj" : "Generate"}
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3 mb-6">
            <Link
              href={`/olympiad/${tenantSlug}/survey/live`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-certo-navy/10 dark:border-certo-dark-border text-sm font-medium hover:bg-gray-50 dark:hover:bg-certo-dark-surface transition-colors"
            >
              📡 {isPl ? "Live Session QR" : "Live Session QR"}
            </Link>
          </div>

          {/* Generated links */}
          {links.length === 0 ? (
            <div className="text-center py-12 text-certo-navy/40 dark:text-certo-dark-muted">
              <div className="text-4xl mb-3">🔗</div>
              <p>{isPl ? "Wygeneruj pierwszy link dla swojej społeczności" : "Generate your first link for your community"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold">{link.cohortName}</span>
                      <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                        {link.groupName} · {link.currentUses}/{link.maxUses}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {isPl ? "Aktywny" : "Active"}
                    </span>
                  </div>

                  {/* Link URL */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      readOnly
                      value={link.url}
                      className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-certo-dark-bg border border-certo-navy/10 dark:border-certo-dark-border font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(link.url, `url-${link.id}`)}
                      className="px-3 py-2 text-xs font-medium rounded-lg border border-certo-navy/10 dark:border-certo-dark-border hover:bg-gray-50 dark:hover:bg-certo-dark-surface transition-colors"
                    >
                      {copiedId === `url-${link.id}` ? "✅" : "📋"}
                    </button>
                  </div>

                  {/* WhatsApp message */}
                  <details className="group">
                    <summary className="text-xs text-certo-gold cursor-pointer font-medium">
                      {isPl ? "📱 Gotowa wiadomość WhatsApp" : "📱 Ready WhatsApp message"}
                    </summary>
                    <div className="mt-2 flex gap-2">
                      <textarea
                        readOnly
                        value={link.whatsappMsg}
                        rows={3}
                        className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-certo-dark-bg border border-certo-navy/10 dark:border-certo-dark-border resize-none"
                      />
                      <button
                        onClick={() => copyToClipboard(link.whatsappMsg, `wa-${link.id}`)}
                        className="px-3 py-2 text-xs font-medium rounded-lg border border-certo-navy/10 dark:border-certo-dark-border hover:bg-gray-50 dark:hover:bg-certo-dark-surface transition-colors self-start"
                      >
                        {copiedId === `wa-${link.id}` ? "✅" : "📋"}
                      </button>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Participation */}
      {activeTab === "participation" && (
        <div>
          <div className="grid gap-4 md:grid-cols-2">
            {config.survey_groups.map((group) => {
              const data = participation[group.group_id];
              const threshold = config.thresholds[group.group_id];
              if (!data) return null;

              const meetsMin = threshold ? data.pct >= threshold.min_pct : true;
              const meetsBonus = threshold ? data.pct >= threshold.bonus_pct : false;

              return (
                <div
                  key={group.group_id}
                  className="p-6 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">{t(group.name)}</h3>
                    <span
                      className={`text-2xl font-bold ${
                        meetsBonus ? "text-green-500" : meetsMin ? "text-certo-gold" : "text-red-400"
                      }`}
                    >
                      {data.pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative w-full h-4 bg-gray-200 dark:bg-certo-dark-border rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        meetsBonus ? "bg-green-500" : meetsMin ? "bg-certo-gold" : "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(data.pct, 100)}%` }}
                    />
                    {/* Threshold markers */}
                    {threshold && (
                      <>
                        <div
                          className="absolute top-0 h-full w-0.5 bg-red-500/50"
                          style={{ left: `${threshold.min_pct}%` }}
                          title={`Min: ${threshold.min_pct}%`}
                        />
                        <div
                          className="absolute top-0 h-full w-0.5 bg-green-500/50"
                          style={{ left: `${threshold.bonus_pct}%` }}
                          title={`Bonus: ${threshold.bonus_pct}%`}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex justify-between text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                    <span>
                      {data.count} / {data.total}{" "}
                      {isPl ? "odpowiedzi" : "responses"}
                    </span>
                    <div className="flex gap-3">
                      {threshold && (
                        <>
                          <span>
                            min. {threshold.min_pct}%{" "}
                            {meetsMin ? "✅" : "❌"}
                          </span>
                          <span>
                            bonus {threshold.bonus_pct}%{" "}
                            {meetsBonus ? "🌟" : "—"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 text-center p-4 rounded-xl bg-certo-gold/10 dark:bg-certo-gold/5 border border-certo-gold/20">
            <span className="text-sm font-medium">
              {isPl ? "Łącznie odpowiedzi:" : "Total responses:"}{" "}
              <strong>
                {Object.values(participation).reduce((s, d) => s + d.count, 0)}
              </strong>{" "}
              / {Object.values(participation).reduce((s, d) => s + d.total, 0)}
              {dataSource === "demo" && (
                <span className="ml-2 text-xs text-certo-navy/40 dark:text-certo-dark-muted">(demo)</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* TAB: Phases */}
      {activeTab === "phases" && (
        <div className="space-y-4">
          {[
            {
              phase: "I",
              title: { pl: "Samoocena governance", en: "Governance self-assessment" },
              status: "active" as const,
              desc: { pl: "Dystrybucja ankiet i zbieranie odpowiedzi", en: "Distribute surveys and collect responses" },
            },
            {
              phase: "II",
              title: { pl: "Test wiedzy", en: "Knowledge test" },
              status: "upcoming" as const,
              desc: { pl: `${config.knowledge_test.num_questions} pytań, ${config.knowledge_test.duration_min} min, test drużynowy`, en: `${config.knowledge_test.num_questions} questions, ${config.knowledge_test.duration_min} min, team test` },
            },
            {
              phase: "III",
              title: { pl: "Certo Action", en: "Certo Action" },
              status: "upcoming" as const,
              desc: { pl: "Plan poprawy najsłabszego filaru", en: "Improvement plan for weakest pillar" },
            },
            {
              phase: "IV",
              title: { pl: "Gala Diamentów Certo", en: "Diament Certo Gala" },
              status: "upcoming" as const,
              desc: { pl: "Wręczenie certyfikatów i Diamentów", en: "Certificate and Diament ceremony" },
            },
          ].map((p) => (
            <div
              key={p.phase}
              className={`p-5 rounded-xl border ${
                p.status === "active"
                  ? "border-certo-gold bg-certo-gold/5 dark:bg-certo-gold/5"
                  : "border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    p.status === "active"
                      ? "bg-certo-gold text-white"
                      : "bg-gray-200 dark:bg-certo-dark-border text-gray-500"
                  }`}
                >
                  {p.phase}
                </span>
                <div>
                  <div className="font-bold">{t(p.title)}</div>
                  <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                    {t(p.desc)}
                  </div>
                </div>
                {p.status === "active" && (
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-certo-gold/20 text-certo-gold font-semibold">
                    {isPl ? "Aktywna" : "Active"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
