"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────
type OrgDetail = {
  org_id: string;
  org_name: string;
  tenant_id: string;
  tenant_name: string;
  country: string;
  municipality: string | null;
  phase: string;
  certo_score: number | null;
  certo_vector: string | null;
  level: string | null;
  participation_rates: Record<string, number> | null;
  pillar_scores: Record<string, number> | null;
  total_responses: number;
  created_at: string;
  coordinator_name: string | null;
  team_members: string[];
  action_plan: { weakest_pillar: string; plan: string; steps: string[]; metrics: string[] } | null;
  peer_review_avg: number | null;
  test_score: number | null;
  test_passed: boolean | null;
};

// ── Constants ──────────────────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  PL: "Polska", AT: "Austria", BE: "Belgia", BG: "Bułgaria", HR: "Chorwacja",
  CY: "Cypr", CZ: "Czechy", DK: "Dania", EE: "Estonia", FI: "Finlandia",
  FR: "Francja", DE: "Niemcy", GR: "Grecja", HU: "Węgry", IE: "Irlandia",
  IT: "Włochy", LV: "Łotwa", LT: "Litwa", LU: "Luksemburg", MT: "Malta",
  NL: "Holandia", PT: "Portugalia", RO: "Rumunia", SK: "Słowacja",
  SI: "Słowenia", ES: "Hiszpania", SE: "Szwecja",
};

const PHASES = [
  { id: "registration", label: "Rejestracja", icon: "📝" },
  { id: "survey", label: "Ankiety", icon: "📊" },
  { id: "test", label: "Test", icon: "🧠" },
  { id: "action", label: "Certo Action", icon: "🚀" },
  { id: "review", label: "Peer-Review", icon: "🔍" },
  { id: "gala", label: "Gala", icon: "💎" },
];

const PILLARS = [
  { id: "operational", name: "Dyscyplina operacyjna", friendly: "Jasne zasady", weight: 25 },
  { id: "stakeholders", name: "Relacje z interesariuszami", friendly: "Współpraca", weight: 25 },
  { id: "decisions", name: "Zarządzanie decyzjami", friendly: "Sprawiedliwe decyzje", weight: 20 },
  { id: "stability", name: "Stabilność strukturalna", friendly: "Stałość", weight: 15 },
  { id: "transparency", name: "Indeks transparentności", friendly: "Otwartość", weight: 15 },
];

const LEVEL_INFO: Record<string, { label: string; color: string; bg: string }> = {
  bronze: { label: "Certo Bronze", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  silver: { label: "Certo Silver", color: "text-gray-700", bg: "bg-gray-100 border-gray-300" },
  gold: { label: "Certo Gold", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-300" },
  diament: { label: "Diament Certo", color: "text-certo-gold", bg: "bg-certo-gold/10 border-certo-gold" },
};

// ── Demo data ─────────────────────────────────────────────────────
const DEMO: Record<string, OrgDetail> = {
  "1": { org_id: "1", org_name: "SP nr 15 im. Jana Pawła II", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Warszawa", phase: "action", certo_score: 78, certo_vector: "+", level: "silver", participation_rates: { students: 72, teachers: 88, parents: 34, staff: 65 }, pillar_scores: { operational: 82, stakeholders: 71, decisions: 80, stability: 75, transparency: 68 }, total_responses: 245, created_at: "2026-09-15", coordinator_name: "Anna Kowalska", team_members: ["Jan Nowak", "Maria Wiśniewska", "Piotr Zieliński"], action_plan: { weakest_pillar: "transparency", plan: "Zwiększenie transparentności decyzji budżetowych", steps: ["Publikacja budżetu na stronie szkoły", "Newsletter miesięczny dla rodziców", "Dzień otwarty z dyrekcją raz na kwartał"], metrics: ["50% rodziców odwiedza stronę budżetu", "80% otwarć newslettera"] }, peer_review_avg: 4.2, test_score: 80, test_passed: true },
  "2": { org_id: "2", org_name: "Liceum Ogólnokształcące nr 3", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Kraków", phase: "gala", certo_score: 92, certo_vector: "++", level: "diament", participation_rates: { students: 85, teachers: 95, parents: 61, staff: 78 }, pillar_scores: { operational: 94, stakeholders: 90, decisions: 93, stability: 88, transparency: 95 }, total_responses: 512, created_at: "2026-09-12", coordinator_name: "Tomasz Wójcik", team_members: ["Katarzyna Dąbrowska", "Adam Lewandowski", "Ewa Kamińska", "Marek Szymański"], action_plan: { weakest_pillar: "stability", plan: "Wzmocnienie ciągłości kadry i procesów", steps: ["Program mentoringu dla nowych nauczycieli", "Dokumentacja procesów kluczowych", "Roczny plan sukcesji"], metrics: ["Retencja kadry >90%", "100% procesów udokumentowanych"] }, peer_review_avg: 4.8, test_score: 95, test_passed: true },
};

// ── Component ─────────────────────────────────────────────────────
export default function OrgDetailClient({ locale, orgId }: { locale: string; orgId: string }) {
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    // TODO: Fetch from API
    setOrg(DEMO[orgId] || DEMO["1"]);
    const saved = localStorage.getItem("certo-olympiad-watched");
    if (saved) setIsWatched(JSON.parse(saved).includes(orgId));
  }, [orgId]);

  const toggleWatch = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("certo-olympiad-watched") || "[]");
    const next = isWatched ? saved.filter((id: string) => id !== orgId) : [...saved, orgId];
    localStorage.setItem("certo-olympiad-watched", JSON.stringify(next));
    setIsWatched(!isWatched);
  }, [orgId, isWatched]);

  if (!org) return <div className="min-h-screen bg-certo-surface flex items-center justify-center text-certo-fg-muted">Ładowanie...</div>;

  const currentPhaseIdx = PHASES.findIndex((p) => p.id === org.phase);
  const level = org.level ? LEVEL_INFO[org.level] : null;

  return (
    <div className="min-h-screen bg-certo-surface">
      {/* Header */}
      <div className="bg-certo-navy text-certo-cream">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href={`/${locale}/olympiad/participants`} className="text-certo-cream/60 hover:text-certo-cream text-sm mb-4 inline-block">
            ← Wszyscy uczestnicy
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">{org.org_name}</h1>
              <p className="text-certo-cream/70 mt-1">
                📍 {org.municipality}, {COUNTRY_NAMES[org.country]} &middot; {org.tenant_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleWatch}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isWatched
                    ? "bg-certo-gold text-white"
                    : "bg-white/10 text-certo-cream hover:bg-white/20"
                }`}
              >
                {isWatched ? "⭐ Obserwujesz" : "☆ Obserwuj"}
              </button>
            </div>
          </div>

          {/* Score + Level */}
          {org.certo_score != null && (
            <div className="flex items-center gap-4 mt-6">
              <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
                <div className="text-4xl font-bold text-certo-gold">{org.certo_score}</div>
                <div className="text-xs text-certo-cream/60 mt-1">Certo Score</div>
              </div>
              {org.certo_vector && (
                <div className="bg-white/10 rounded-xl px-4 py-4 text-center">
                  <div className="text-2xl font-bold text-certo-cream">{org.certo_vector}</div>
                  <div className="text-xs text-certo-cream/60 mt-1">Certo Vector</div>
                </div>
              )}
              {level && (
                <div className={`rounded-xl px-4 py-4 text-center border ${level.bg}`}>
                  <div className={`text-lg font-bold ${level.color}`}>{level.label}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Phase pipeline */}
        <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
          <h2 className="text-lg font-serif font-bold text-certo-fg mb-4">Postęp w olimpiadzie</h2>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PHASES.map((phase, idx) => {
              const isDone = idx < currentPhaseIdx;
              const isCurrent = idx === currentPhaseIdx;
              return (
                <div key={phase.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                      isCurrent
                        ? "bg-certo-gold text-white font-bold"
                        : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-certo-surface text-certo-fg-muted"
                    }`}
                  >
                    <span>{isDone ? "✓" : phase.icon}</span>
                    <span>{phase.label}</span>
                  </div>
                  {idx < PHASES.length - 1 && (
                    <div className={`w-4 h-0.5 mx-1 ${isDone ? "bg-emerald-400" : "bg-certo-card-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pillar scores */}
        {org.pillar_scores && (
          <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
            <h2 className="text-lg font-serif font-bold text-certo-fg mb-4">Wyniki filarów governance</h2>
            <div className="space-y-3">
              {PILLARS.map((pillar) => {
                const score = org.pillar_scores?.[pillar.id] ?? 0;
                const barColor =
                  score >= 90 ? "bg-certo-gold" :
                  score >= 80 ? "bg-emerald-500" :
                  score >= 65 ? "bg-blue-500" :
                  score >= 50 ? "bg-orange-500" :
                  "bg-red-500";
                return (
                  <div key={pillar.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-certo-fg">{pillar.friendly}</span>
                        <span className="text-xs text-certo-fg-muted ml-2">({pillar.name}, {pillar.weight}%)</span>
                      </div>
                      <span className="text-sm font-bold text-certo-fg">{score}</span>
                    </div>
                    <div className="h-3 bg-certo-surface rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participation rates */}
        {org.participation_rates && (
          <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
            <h2 className="text-lg font-serif font-bold text-certo-fg mb-4">Frekwencja ankiet</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "students", label: "Uczniowie", icon: "🎓" },
                { key: "teachers", label: "Nauczyciele", icon: "👩‍🏫" },
                { key: "parents", label: "Rodzice", icon: "👨‍👩‍👧" },
                { key: "staff", label: "Pracownicy", icon: "🏢" },
              ].map(({ key, label, icon }) => {
                const rate = org.participation_rates?.[key];
                if (rate == null) return null;
                return (
                  <div key={key} className="text-center bg-certo-surface rounded-lg p-4">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className={`text-2xl font-bold ${rate >= 50 ? "text-emerald-600" : rate >= 30 ? "text-certo-gold" : "text-red-500"}`}>
                      {rate}%
                    </div>
                    <div className="text-xs text-certo-fg-muted">{label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-certo-fg-muted text-center">
              Łącznie {org.total_responses} głosów
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Test score */}
          {org.test_score != null && (
            <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
              <h2 className="text-lg font-serif font-bold text-certo-fg mb-3">🧠 Test wiedzy</h2>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-certo-fg">{org.test_score}%</div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  org.test_passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                  {org.test_passed ? "✓ Zaliczony" : "✗ Niezaliczony"}
                </span>
              </div>
              <p className="text-xs text-certo-fg-muted mt-2">Test drużynowy, 10 pytań, próg 60%</p>
            </div>
          )}

          {/* Peer-review */}
          {org.peer_review_avg != null && (
            <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
              <h2 className="text-lg font-serif font-bold text-certo-fg mb-3">🔍 Peer-Review</h2>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-certo-fg">{org.peer_review_avg}</div>
                <div className="text-certo-fg-muted text-sm">/ 5.0</div>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-lg ${star <= Math.round(org.peer_review_avg!) ? "text-certo-gold" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs text-certo-fg-muted mt-2">Średnia z ocen innych organizacji (skala 1–5)</p>
            </div>
          )}
        </div>

        {/* Certo Action */}
        {org.action_plan && (
          <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
            <h2 className="text-lg font-serif font-bold text-certo-fg mb-3">🚀 Certo Action</h2>
            <div className="mb-3">
              <span className="text-xs text-certo-fg-muted">Najsłabszy filar:</span>
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                {PILLARS.find((p) => p.id === org.action_plan!.weakest_pillar)?.friendly || org.action_plan.weakest_pillar}
              </span>
            </div>
            <p className="text-certo-fg mb-4">{org.action_plan.plan}</p>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-certo-fg mb-2">Kroki:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-certo-fg-muted">
                {org.action_plan.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-medium text-certo-fg mb-2">Wskaźniki sukcesu:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-certo-fg-muted">
                {org.action_plan.metrics.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Team */}
        <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
          <h2 className="text-lg font-serif font-bold text-certo-fg mb-3">👥 Rada Olimpijska</h2>
          {org.coordinator_name && (
            <div className="mb-3">
              <span className="text-xs text-certo-fg-muted">Koordynator:</span>
              <span className="ml-2 text-sm font-medium text-certo-fg">{org.coordinator_name}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {org.team_members.map((m, i) => (
              <span key={i} className="px-3 py-1 bg-certo-surface rounded-full text-sm text-certo-fg">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-certo-card rounded-xl border border-certo-card-border p-6">
          <h2 className="text-lg font-serif font-bold text-certo-fg mb-3">ℹ️ Informacje</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-certo-fg-muted">Data rejestracji:</span>
              <span className="ml-2 text-certo-fg">{new Date(org.created_at).toLocaleDateString("pl-PL")}</span>
            </div>
            <div>
              <span className="text-certo-fg-muted">Kraj:</span>
              <span className="ml-2 text-certo-fg">{COUNTRY_NAMES[org.country]}</span>
            </div>
            <div>
              <span className="text-certo-fg-muted">Gmina:</span>
              <span className="ml-2 text-certo-fg">{org.municipality}</span>
            </div>
            <div>
              <span className="text-certo-fg-muted">Olimpiada:</span>
              <span className="ml-2 text-certo-fg">{org.tenant_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
