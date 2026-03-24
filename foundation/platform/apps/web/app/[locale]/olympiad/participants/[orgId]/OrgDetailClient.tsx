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
  action_plans: {
    id: string;
    title: string;
    weakest_pillar: string;
    plan: string;
    steps: { text: string; startDate: string; endDate: string; status: string; proof: string }[];
    metrics: string[];
  }[] | null;
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
  "1": { org_id: "1", org_name: "SP nr 15 im. Jana Pawła II", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Warszawa", phase: "action", certo_score: 78, certo_vector: "+", level: "silver", participation_rates: { students: 72, teachers: 88, parents: 34, staff: 65 }, pillar_scores: { operational: 82, stakeholders: 71, decisions: 80, stability: 75, transparency: 68 }, total_responses: 245, created_at: "2026-09-15", coordinator_name: "Anna Kowalska", team_members: ["Jan Nowak", "Maria Wiśniewska", "Piotr Zieliński"], action_plans: [
    { id: "a1", title: "Transparentność budżetu", weakest_pillar: "transparency", plan: "Rodzice nie wiedzą, na co szkoła wydaje pieniądze z komitetu rodzicielskiego. Chcemy to zmienić publikując budżet online i organizując regularne spotkania.", steps: [
      { text: "Przygotowanie uproszczonego zestawienia budżetu w formie infografiki", startDate: "2026-10-01", endDate: "2026-10-10", status: "completed", proof: "Infografika gotowa — zatwierdzona przez księgową i dyrektora. PDF na dysku współdzielonym." },
      { text: "Publikacja budżetu na stronie szkoły + wysyłka do rodziców przez e-dziennik", startDate: "2026-10-10", endDate: "2026-10-17", status: "completed", proof: "https://sp15.edu.pl/budzet — 312 wyświetleń w pierwszym tygodniu" },
      { text: "Uruchomienie comiesięcznego newslettera „Złotówka SP15" z podsumowaniem wydatków", startDate: "2026-10-17", endDate: "2026-11-01", status: "in-progress", proof: "" },
      { text: "Pierwszy „Dzień Otwarty Budżetu" — spotkanie z rodzicami i prezentacja wydatków", startDate: "2026-11-15", endDate: "2026-11-22", status: "planned", proof: "" },
      { text: "Ankieta ewaluacyjna wśród rodziców: czy czują się lepiej poinformowani?", startDate: "2026-11-25", endDate: "2026-12-05", status: "planned", proof: "" }
    ], metrics: ["60% rodziców odwiedza stronę budżetu", "80% otwarć newslettera", "40+ rodziców na Dniu Otwartym"] },
    { id: "a2", title: "Komunikacja z rodzicami", weakest_pillar: "stakeholders", plan: "Rodzice zgłaszają, że trudno się skontaktować ze szkołą i że informacje przychodzą za późno. Wdrażamy szybkie kanały komunikacji.", steps: [
      { text: "Ankieta potrzeb komunikacyjnych wśród rodziców (online, 5 pytań)", startDate: "2026-10-05", endDate: "2026-10-15", status: "completed", proof: "127 odpowiedzi zebranych. Top 3 problemy: spóźnione info o wycieczkach, brak odpowiedzi na maile, nieczytelne ogłoszenia." },
      { text: "Utworzenie grup WhatsApp per klasa (wychowawca + rodzice)", startDate: "2026-10-15", endDate: "2026-10-25", status: "completed", proof: "18 grup utworzonych, 89% rodziców dołączyło. Szablon powitalny rozesłany." },
      { text: "Wdrożenie zasady „odpowiedź w 24h" na wiadomości od rodziców", startDate: "2026-10-25", endDate: "2026-11-08", status: "in-progress", proof: "" },
      { text: "Szkolenie nauczycieli z komunikacji z rodzicami (2h warsztat)", startDate: "2026-11-10", endDate: "2026-11-17", status: "planned", proof: "" }
    ], metrics: ["Czas odpowiedzi <24h", "90% rodziców w grupach klasowych", "Satysfakcja rodziców >4.0/5.0"] },
    { id: "a3", title: "Głos uczniów w decyzjach szkoły", weakest_pillar: "decisions", plan: "Samorząd uczniowski istnieje formalnie, ale nie ma realnego wpływu na decyzje. Chcemy dać uczniom prawdziwy głos.", steps: [
      { text: "Spotkanie z samorządem — zebranie listy spraw, w których uczniowie chcą mieć wpływ", startDate: "2026-10-08", endDate: "2026-10-15", status: "completed", proof: "Lista 12 tematów. Top 3: jadłospis stołówki, zasady korzystania z telefonów, wybór wycieczek klasowych." },
      { text: "Wprowadzenie „Skrzynki pomysłów" (fizyczna + online) z comiesięcznym losowaniem", startDate: "2026-10-20", endDate: "2026-11-01", status: "in-progress", proof: "" },
      { text: "Pierwsze „Konsultacje uczniowskie" — dyrektor spotyka się z samorządem co 2 tygodnie", startDate: "2026-11-05", endDate: "2026-11-20", status: "planned", proof: "" }
    ], metrics: ["Min. 20 pomysłów miesięcznie w Skrzynce", "3+ decyzje podjęte wspólnie z uczniami", "80% uczniów wie o Konsultacjach"] }
  ], peer_review_avg: 4.2, test_score: 80, test_passed: true },
  "2": { org_id: "2", org_name: "Liceum Ogólnokształcące nr 3", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Kraków", phase: "gala", certo_score: 92, certo_vector: "++", level: "diament", participation_rates: { students: 85, teachers: 95, parents: 61, staff: 78 }, pillar_scores: { operational: 94, stakeholders: 90, decisions: 93, stability: 88, transparency: 95 }, total_responses: 512, created_at: "2026-09-12", coordinator_name: "Tomasz Wójcik", team_members: ["Katarzyna Dąbrowska", "Adam Lewandowski", "Ewa Kamińska", "Marek Szymański"], action_plans: [
    { id: "b1", title: "Ciągłość kadry", weakest_pillar: "stability", plan: "Wzmocnienie ciągłości kadry i procesów", steps: [{ text: "Program mentoringu dla nowych nauczycieli", startDate: "2026-09-20", endDate: "2026-10-15", status: "completed", proof: "12 par mentor-mentee" }, { text: "Dokumentacja procesów kluczowych", startDate: "2026-10-15", endDate: "2026-11-15", status: "completed", proof: "Wiki wewnętrzne — 45 procesów" }, { text: "Roczny plan sukcesji", startDate: "2026-11-15", endDate: "2026-12-01", status: "completed", proof: "Zatwierdzony przez radę pedagogiczną" }], metrics: ["Retencja kadry >90%", "100% procesów udokumentowanych"] }
  ], peer_review_avg: 4.8, test_score: 95, test_passed: true },
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

        {/* Certo Action — Roadmapa */}
        {org.action_plans && org.action_plans.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-certo-fg">🚀 Certo Action — Droga do Zmiany</h2>

            {org.action_plans.map((plan) => {
              const totalSteps = plan.steps.length;
              const completedSteps = plan.steps.filter((s) => s.status === "completed").length;
              const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
              const pillarInfo = PILLARS.find((p) => p.id === plan.weakest_pillar);

              return (
                <div key={plan.id} className="bg-certo-card rounded-xl border border-certo-card-border p-6">
                  {/* Plan header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-certo-fg">{plan.title}</h3>
                      <p className="text-sm text-certo-fg-muted mt-1">{plan.plan}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium whitespace-nowrap">
                      {pillarInfo?.friendly || plan.weakest_pillar}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs text-certo-fg-muted mb-1">
                      <span>{completedSteps}/{totalSteps} kroków</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-certo-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? "bg-emerald-500" : progress > 0 ? "bg-certo-gold" : "bg-gray-300"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-8 space-y-4">
                    <div className="absolute left-3 top-1 bottom-1 w-0.5 bg-gradient-to-b from-certo-gold via-certo-gold/40 to-certo-card-border rounded-full" />

                    {plan.steps.map((step, i) => {
                      const isCompleted = step.status === "completed";
                      const isInProgress = step.status === "in-progress";
                      return (
                        <div key={i} className="relative">
                          <div className={`absolute -left-5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-certo-card ${
                            isCompleted ? "bg-emerald-500 text-white" :
                            isInProgress ? "bg-blue-500 text-white" :
                            "bg-gray-200 text-gray-500"
                          }`}>
                            {isCompleted ? "✓" : i + 1}
                          </div>

                          <div className={`rounded-lg border p-3 ${
                            isCompleted ? "border-emerald-200 bg-emerald-50/50" :
                            isInProgress ? "border-blue-200 bg-blue-50/50" :
                            "border-certo-card-border"
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-certo-fg">{step.text}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                                isCompleted ? "bg-emerald-100 text-emerald-700" :
                                isInProgress ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-500"
                              }`}>
                                {isCompleted ? "✅ Zrealizowany" : isInProgress ? "⚡ W realizacji" : "📋 Zaplanowany"}
                              </span>
                            </div>

                            {(step.startDate || step.endDate) && (
                              <div className="text-[11px] text-certo-fg-muted mt-1">
                                {step.startDate && <>🚀 {new Date(step.startDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}</>}
                                {step.startDate && step.endDate && " → "}
                                {step.endDate && <>🏁 {new Date(step.endDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}</>}
                              </div>
                            )}

                            {isCompleted && step.proof && (
                              <div className="mt-2 p-2 rounded bg-emerald-100/50 text-xs text-emerald-700">
                                📎 {step.proof}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metrics */}
                  {plan.metrics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-certo-card-border">
                      <h4 className="text-xs font-medium text-certo-fg-muted mb-2">Wskaźniki sukcesu:</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.metrics.map((m, i) => (
                          <span key={i} className="px-2 py-1 bg-certo-surface rounded text-xs text-certo-fg">
                            📏 {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
