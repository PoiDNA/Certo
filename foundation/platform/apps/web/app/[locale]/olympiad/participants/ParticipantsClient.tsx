"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────
type Participant = {
  org_id: string;
  org_name: string;
  tenant_id: string;
  tenant_name: string;
  country: string;
  municipality: string | null;
  phase: "registration" | "survey" | "test" | "action" | "review" | "gala";
  certo_score: number | null;
  certo_vector: string | null;
  level: "none" | "bronze" | "silver" | "gold" | "diament" | null;
  participation_rates: Record<string, number> | null;
  pillar_scores: Record<string, number> | null;
  total_responses: number;
  created_at: string;
};

type SortKey =
  | "org_name"
  | "country"
  | "tenant_name"
  | "phase"
  | "certo_score"
  | "total_responses"
  | "created_at";

type ViewMode = "map" | "table" | "both";

// ── Constants ──────────────────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  PL: "Polska", AT: "Austria", BE: "Belgia", BG: "Bułgaria", HR: "Chorwacja",
  CY: "Cypr", CZ: "Czechy", DK: "Dania", EE: "Estonia", FI: "Finlandia",
  FR: "Francja", DE: "Niemcy", GR: "Grecja", HU: "Węgry", IE: "Irlandia",
  IT: "Włochy", LV: "Łotwa", LT: "Litwa", LU: "Luksemburg", MT: "Malta",
  NL: "Holandia", PT: "Portugalia", RO: "Rumunia", SK: "Słowacja",
  SI: "Słowenia", ES: "Hiszpania", SE: "Szwecja",
};

const PHASE_INFO: Record<string, { label: string; color: string; order: number }> = {
  registration: { label: "Rejestracja", color: "bg-gray-100 text-gray-600", order: 0 },
  survey: { label: "Faza I — Ankiety", color: "bg-blue-100 text-blue-700", order: 1 },
  test: { label: "Faza II — Test", color: "bg-indigo-100 text-indigo-700", order: 2 },
  action: { label: "Faza III — Certo Action", color: "bg-purple-100 text-purple-700", order: 3 },
  review: { label: "Faza III — Peer-Review", color: "bg-violet-100 text-violet-700", order: 4 },
  gala: { label: "Faza IV — Gala", color: "bg-certo-gold/20 text-certo-gold", order: 5 },
};

const LEVEL_INFO: Record<string, { label: string; color: string; icon: string }> = {
  none: { label: "—", color: "", icon: "" },
  bronze: { label: "Certo Bronze", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🥉" },
  silver: { label: "Certo Silver", color: "bg-gray-200 text-gray-700 border-gray-300", icon: "🥈" },
  gold: { label: "Certo Gold", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "🥇" },
  diament: { label: "Diament Certo", color: "bg-certo-gold/20 text-certo-gold border-certo-gold", icon: "💎" },
};

const PILLARS = [
  { id: "operational", name: "Dyscyplina operacyjna", friendly: "Jasne zasady" },
  { id: "stakeholders", name: "Relacje z interesariuszami", friendly: "Współpraca" },
  { id: "decisions", name: "Zarządzanie decyzjami", friendly: "Sprawiedliwe decyzje" },
  { id: "stability", name: "Stabilność strukturalna", friendly: "Stałość" },
  { id: "transparency", name: "Indeks transparentności", friendly: "Otwartość" },
];

// ── Demo data ──────────────────────────────────────────────────────
const DEMO_PARTICIPANTS: Participant[] = [
  { org_id: "1", org_name: "SP nr 15 im. Jana Pawła II", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Warszawa", phase: "action", certo_score: 78, certo_vector: "+", level: "silver", participation_rates: { students: 72, teachers: 88, parents: 34 }, pillar_scores: { operational: 82, stakeholders: 71, decisions: 80, stability: 75, transparency: 68 }, total_responses: 245, created_at: "2026-09-15" },
  { org_id: "2", org_name: "Liceum Ogólnokształcące nr 3", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Kraków", phase: "gala", certo_score: 92, certo_vector: "++", level: "diament", participation_rates: { students: 85, teachers: 95, parents: 61 }, pillar_scores: { operational: 94, stakeholders: 90, decisions: 93, stability: 88, transparency: 95 }, total_responses: 512, created_at: "2026-09-12" },
  { org_id: "3", org_name: "Zespół Szkół Technicznych", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Wrocław", phase: "survey", certo_score: null, certo_vector: null, level: null, participation_rates: { students: 45, teachers: 60, parents: 12 }, pillar_scores: null, total_responses: 89, created_at: "2026-10-01" },
  { org_id: "4", org_name: "Grundschule am See", tenant_id: "schools", tenant_name: "Schulen", country: "DE", municipality: "Berlin", phase: "test", certo_score: 65, certo_vector: "→", level: "silver", participation_rates: { students: 68, teachers: 80, parents: 28 }, pillar_scores: { operational: 70, stakeholders: 62, decisions: 68, stability: 60, transparency: 65 }, total_responses: 178, created_at: "2026-09-20" },
  { org_id: "5", org_name: "Lycée Victor Hugo", tenant_id: "schools", tenant_name: "Écoles", country: "FR", municipality: "Paris", phase: "action", certo_score: 84, certo_vector: "+", level: "gold", participation_rates: { students: 78, teachers: 90, parents: 42 }, pillar_scores: { operational: 88, stakeholders: 82, decisions: 85, stability: 80, transparency: 85 }, total_responses: 320, created_at: "2026-09-18" },
  { org_id: "6", org_name: "Istituto Comprensivo Roma", tenant_id: "schools", tenant_name: "Scuole", country: "IT", municipality: "Roma", phase: "review", certo_score: 71, certo_vector: "+", level: "silver", participation_rates: { students: 55, teachers: 75, parents: 20 }, pillar_scores: { operational: 75, stakeholders: 68, decisions: 72, stability: 70, transparency: 70 }, total_responses: 198, created_at: "2026-09-22" },
  { org_id: "7", org_name: "Colegio San Fernando", tenant_id: "schools", tenant_name: "Colegios", country: "ES", municipality: "Madrid", phase: "gala", certo_score: 88, certo_vector: "++", level: "gold", participation_rates: { students: 80, teachers: 92, parents: 55 }, pillar_scores: { operational: 90, stakeholders: 85, decisions: 88, stability: 86, transparency: 91 }, total_responses: 410, created_at: "2026-09-10" },
  { org_id: "8", org_name: "Gymnázium Praha", tenant_id: "schools", tenant_name: "Školy", country: "CZ", municipality: "Praha", phase: "survey", certo_score: null, certo_vector: null, level: null, participation_rates: { students: 30, teachers: 50, parents: 8 }, pillar_scores: null, total_responses: 55, created_at: "2026-10-05" },
  { org_id: "9", org_name: "SP nr 42 w Gdańsku", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Gdańsk", phase: "gala", certo_score: 56, certo_vector: "→", level: "bronze", participation_rates: { students: 50, teachers: 65, parents: 18 }, pillar_scores: { operational: 58, stakeholders: 52, decisions: 55, stability: 60, transparency: 55 }, total_responses: 120, created_at: "2026-09-25" },
  { org_id: "10", org_name: "Kolegium Europejskie", tenant_id: "schools", tenant_name: "Szkoły", country: "PL", municipality: "Poznań", phase: "action", certo_score: 73, certo_vector: "+", level: "silver", participation_rates: { students: 62, teachers: 78, parents: 30 }, pillar_scores: { operational: 76, stakeholders: 70, decisions: 74, stability: 72, transparency: 73 }, total_responses: 201, created_at: "2026-09-28" },
];

// ── Main component ─────────────────────────────────────────────────
export default function ParticipantsClient() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "pl";

  // State
  const [participants] = useState<Participant[]>(DEMO_PARTICIPANTS);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("certo_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [showWatchedOnly, setShowWatchedOnly] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Load watched from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("certo-olympiad-watched");
    if (saved) setWatched(new Set(JSON.parse(saved)));
  }, []);

  // Save watched to localStorage
  const toggleWatch = useCallback(
    (orgId: string) => {
      setWatched((prev) => {
        const next = new Set(prev);
        if (next.has(orgId)) next.delete(orgId);
        else next.add(orgId);
        localStorage.setItem("certo-olympiad-watched", JSON.stringify([...next]));
        return next;
      });
    },
    []
  );

  // Toggle compare
  const toggleCompare = useCallback((orgId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(orgId)) return prev.filter((id) => id !== orgId);
      if (prev.length >= 2) return [prev[1], orgId]; // Replace oldest
      return [...prev, orgId];
    });
  }, []);

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...participants];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.org_name.toLowerCase().includes(q) ||
          p.municipality?.toLowerCase().includes(q) ||
          COUNTRY_NAMES[p.country]?.toLowerCase().includes(q)
      );
    }
    if (filterCountry !== "all") list = list.filter((p) => p.country === filterCountry);
    if (filterLevel !== "all") list = list.filter((p) => p.level === filterLevel);
    if (showWatchedOnly) list = list.filter((p) => watched.has(p.org_id));

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "certo_score": return ((a.certo_score ?? -1) - (b.certo_score ?? -1)) * dir;
        case "total_responses": return (a.total_responses - b.total_responses) * dir;
        case "org_name": return a.org_name.localeCompare(b.org_name) * dir;
        case "country": return a.country.localeCompare(b.country) * dir;
        case "phase": return ((PHASE_INFO[a.phase]?.order ?? 0) - (PHASE_INFO[b.phase]?.order ?? 0)) * dir;
        default: return 0;
      }
    });
    return list;
  }, [participants, search, sortKey, sortDir, filterCountry, filterLevel, showWatchedOnly, watched]);

  // Countries with participants
  const countries = useMemo(() => {
    const set = new Set(participants.map((p) => p.country));
    return [...set].sort((a, b) => (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b));
  }, [participants]);

  // Stats
  const stats = useMemo(() => {
    const scored = participants.filter((p) => p.certo_score != null);
    return {
      total: participants.length,
      countries: new Set(participants.map((p) => p.country)).size,
      avgScore: scored.length ? Math.round(scored.reduce((s, p) => s + (p.certo_score || 0), 0) / scored.length) : 0,
      diamenty: participants.filter((p) => p.level === "diament").length,
    };
  }, [participants]);

  // Compare pair
  const comparePair = compareIds.length === 2
    ? [participants.find((p) => p.org_id === compareIds[0])!, participants.find((p) => p.org_id === compareIds[1])!]
    : null;

  return (
    <div className="min-h-screen bg-certo-surface">
      {/* Hero */}
      <div className="bg-certo-navy text-certo-cream py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Uczestnicy Olimpiady Certo</h1>
          <p className="text-certo-cream/70 max-w-2xl mx-auto">
            Wszystkie organizacje uczestniczące w Olimpiadzie Certo. Obserwuj, porównuj i śledź postępy.
          </p>
          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { label: "Organizacji", value: stats.total, icon: "🏫" },
              { label: "Krajów UE", value: stats.countries, icon: "🇪🇺" },
              { label: "Średni Score", value: stats.avgScore, icon: "📊" },
              { label: "Diamentów", value: stats.diamenty, icon: "💎" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-2xl font-bold text-certo-gold">{s.value}</div>
                <div className="text-xs text-certo-cream/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Szukaj organizacji, miasta, kraju..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-certo-card-border bg-certo-card text-certo-fg placeholder:text-certo-fg-muted/50"
          />

          {/* Country filter */}
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-3 py-2 rounded-lg border border-certo-card-border bg-certo-card text-certo-fg text-sm"
          >
            <option value="all">🌍 Wszystkie kraje</option>
            {countries.map((c) => (
              <option key={c} value={c}>{COUNTRY_NAMES[c] || c}</option>
            ))}
          </select>

          {/* Level filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-certo-card-border bg-certo-card text-certo-fg text-sm"
          >
            <option value="all">Wszystkie poziomy</option>
            <option value="diament">💎 Diament</option>
            <option value="gold">🥇 Gold</option>
            <option value="silver">🥈 Silver</option>
            <option value="bronze">🥉 Bronze</option>
          </select>

          {/* Watch filter */}
          <button
            onClick={() => setShowWatchedOnly(!showWatchedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              showWatchedOnly
                ? "bg-certo-gold text-white"
                : "bg-certo-card border border-certo-card-border text-certo-fg"
            }`}
          >
            👁️ Obserwowane ({watched.size})
          </button>

          {/* Compare button */}
          {compareIds.length === 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="px-4 py-2 rounded-lg bg-certo-navy text-certo-cream text-sm font-medium"
            >
              ⚖️ Porównaj ({compareIds.length}/2)
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-certo-fg-muted">
            {filtered.length} {filtered.length === 1 ? "organizacja" : "organizacji"}
            {showWatchedOnly && " (obserwowane)"}
          </p>
          <div className="flex gap-1">
            {(["table", "both"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs rounded ${
                  viewMode === m ? "bg-certo-navy text-certo-cream" : "bg-certo-card text-certo-fg-muted"
                }`}
              >
                {m === "table" ? "📋 Tabela" : "🗺️ Mapa + Tabela"}
              </button>
            ))}
          </div>
        </div>

        {/* Map view */}
        {viewMode === "both" && (
          <ParticipantMap participants={filtered} locale={locale} />
        )}

        {/* Compare modal */}
        {showCompare && comparePair && (
          <CompareModal
            a={comparePair[0]}
            b={comparePair[1]}
            locale={locale}
            onClose={() => setShowCompare(false)}
          />
        )}

        {/* Table */}
        <div className="bg-certo-card rounded-xl border border-certo-card-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-certo-card-border bg-certo-surface">
                  <th className="px-3 py-3 text-left w-8">
                    <span title="Obserwuj / Porównaj" className="text-xs text-certo-fg-muted">☆</span>
                  </th>
                  {[
                    { key: "org_name" as SortKey, label: "Organizacja" },
                    { key: "country" as SortKey, label: "Kraj" },
                    { key: "phase" as SortKey, label: "Faza" },
                    { key: "certo_score" as SortKey, label: "Certo Score" },
                    { key: "total_responses" as SortKey, label: "Głosy" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-3 py-3 text-left cursor-pointer hover:bg-certo-card-border/30 select-none"
                    >
                      <span className="flex items-center gap-1 text-certo-fg-muted font-medium">
                        {label}
                        <span className="text-[10px]">
                          {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-certo-fg-muted font-medium">Poziom</th>
                  <th className="px-3 py-3 text-center text-certo-fg-muted font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const phase = PHASE_INFO[p.phase] || PHASE_INFO.registration;
                  const level = LEVEL_INFO[p.level || "none"];
                  const isWatched = watched.has(p.org_id);
                  const isComparing = compareIds.includes(p.org_id);

                  return (
                    <tr
                      key={p.org_id}
                      className={`border-b border-certo-card-border/50 hover:bg-certo-surface/50 transition ${
                        isWatched ? "bg-certo-gold/5" : ""
                      }`}
                    >
                      {/* Watch + Compare checkboxes */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => toggleWatch(p.org_id)}
                            title={isWatched ? "Przestań obserwować" : "Obserwuj"}
                            className="text-lg leading-none"
                          >
                            {isWatched ? "⭐" : "☆"}
                          </button>
                          <button
                            onClick={() => toggleCompare(p.org_id)}
                            title="Porównaj"
                            className={`text-xs leading-none rounded px-1 ${
                              isComparing ? "bg-certo-navy text-white" : "text-certo-fg-muted"
                            }`}
                          >
                            ⚖
                          </button>
                        </div>
                      </td>

                      {/* Org name + municipality */}
                      <td className="px-3 py-3">
                        <Link
                          href={`/${locale}/olympiad/participants/${p.org_id}`}
                          className="font-medium text-certo-fg hover:text-certo-gold transition"
                        >
                          {p.org_name}
                        </Link>
                        {p.municipality && (
                          <div className="text-xs text-certo-fg-muted">{p.municipality}</div>
                        )}
                      </td>

                      {/* Country */}
                      <td className="px-3 py-3 text-certo-fg-muted">
                        {COUNTRY_NAMES[p.country] || p.country}
                      </td>

                      {/* Phase */}
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${phase.color}`}>
                          {phase.label}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-3 py-3">
                        {p.certo_score != null ? (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-certo-fg text-base">{p.certo_score}</span>
                            {p.certo_vector && (
                              <span className="text-xs text-certo-fg-muted">{p.certo_vector}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-certo-fg-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Responses */}
                      <td className="px-3 py-3 text-certo-fg-muted">{p.total_responses}</td>

                      {/* Level badge */}
                      <td className="px-3 py-3 text-center">
                        {p.level && p.level !== "none" ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${level.color}`}>
                            {level.icon} {level.label}
                          </span>
                        ) : (
                          <span className="text-certo-fg-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 text-center">
                        <Link
                          href={`/${locale}/olympiad/participants/${p.org_id}`}
                          className="text-xs text-certo-gold hover:underline"
                        >
                          Szczegóły →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-certo-fg-muted">
              Brak wyników. Zmień filtry lub wyszukiwanie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Compare Modal ─────────────────────────────────────────────────
function CompareModal({
  a,
  b,
  locale,
  onClose,
}: {
  a: Participant;
  b: Participant;
  locale: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-certo-card rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-certo-fg">⚖️ Porównanie organizacji</h2>
          <button onClick={onClose} className="text-certo-fg-muted hover:text-certo-fg text-xl">✕</button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {/* Header */}
          <div className="font-medium text-certo-fg-muted"></div>
          <div className="text-center font-bold text-certo-fg">{a.org_name}</div>
          <div className="text-center font-bold text-certo-fg">{b.org_name}</div>

          {/* Score */}
          <CompareRow label="Certo Score" va={a.certo_score} vb={b.certo_score} format="score" />
          <CompareRow label="Poziom" va={a.level} vb={b.level} format="level" />
          <CompareRow label="Faza" va={a.phase} vb={b.phase} format="phase" />
          <CompareRow label="Certo Vector" va={a.certo_vector} vb={b.certo_vector} format="text" />
          <CompareRow label="Głosy" va={a.total_responses} vb={b.total_responses} format="number" />
          <CompareRow label="Kraj" va={COUNTRY_NAMES[a.country]} vb={COUNTRY_NAMES[b.country]} format="text" />

          {/* Pillar comparison */}
          <div className="col-span-3 mt-4 mb-2">
            <h3 className="font-medium text-certo-fg">Filary governance</h3>
          </div>
          {PILLARS.map((pillar) => (
            <CompareRow
              key={pillar.id}
              label={pillar.friendly}
              va={a.pillar_scores?.[pillar.id] ?? null}
              vb={b.pillar_scores?.[pillar.id] ?? null}
              format="score"
            />
          ))}

          {/* Participation */}
          <div className="col-span-3 mt-4 mb-2">
            <h3 className="font-medium text-certo-fg">Frekwencja</h3>
          </div>
          {["students", "teachers", "parents"].map((group) => (
            <CompareRow
              key={group}
              label={group === "students" ? "Uczniowie" : group === "teachers" ? "Nauczyciele" : "Rodzice"}
              va={a.participation_rates?.[group] ?? null}
              vb={b.participation_rates?.[group] ?? null}
              format="percent"
            />
          ))}
        </div>

        <div className="flex gap-3 mt-6 justify-center">
          <Link
            href={`/${locale}/olympiad/participants/${a.org_id}`}
            className="px-4 py-2 text-sm bg-certo-navy text-certo-cream rounded-lg"
          >
            {a.org_name} →
          </Link>
          <Link
            href={`/${locale}/olympiad/participants/${b.org_id}`}
            className="px-4 py-2 text-sm bg-certo-navy text-certo-cream rounded-lg"
          >
            {b.org_name} →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Compare Row ───────────────────────────────────────────────────
// ── Participant Map (EU with dots) ─────────────────────────────
const CITY_POSITIONS: Record<string, [number, number]> = {
  // [x%, y%] position on a 600x400 EU map
  "Warszawa": [62, 32], "Kraków": [59, 38], "Wrocław": [54, 35],
  "Gdańsk": [57, 24], "Poznań": [53, 31], "Łódź": [58, 34],
  "Berlin": [48, 30], "München": [45, 42], "Hamburg": [43, 26],
  "Paris": [27, 42], "Lyon": [30, 50], "Marseille": [31, 57],
  "Madrid": [14, 58], "Barcelona": [24, 56],
  "Roma": [44, 55], "Milano": [39, 48],
  "Praha": [51, 38], "Budapest": [57, 44],
  "Wien": [50, 42], "Bratislava": [54, 42],
  "Amsterdam": [36, 28], "Bruxelles": [33, 32],
  "Stockholm": [53, 14], "Helsinki": [62, 12],
  "Dublin": [17, 27], "Lisboa": [7, 60],
  "Bucuresti": [68, 48], "Sofia": [66, 52],
  "Zagreb": [52, 48], "Ljubljana": [48, 46],
  "Tallinn": [64, 14], "Riga": [64, 18], "Vilnius": [65, 22],
};

// Fallback: country center positions
const COUNTRY_POSITIONS: Record<string, [number, number]> = {
  PL: [60, 33], DE: [46, 33], FR: [28, 46], ES: [18, 58], IT: [42, 52],
  NL: [36, 28], BE: [33, 32], AT: [49, 42], CZ: [51, 38], SK: [56, 41],
  HU: [57, 44], RO: [68, 46], BG: [66, 50], HR: [52, 48], SI: [48, 46],
  LT: [64, 22], LV: [64, 18], EE: [64, 14], FI: [62, 10], SE: [52, 16],
  DK: [44, 22], IE: [17, 28], PT: [8, 58], GR: [62, 58], MT: [48, 64],
  LU: [34, 36], CY: [78, 58],
};

function ParticipantMap({ participants, locale }: { participants: Participant[]; locale: string }) {
  const dots = useMemo(() => {
    return participants.map((p) => {
      const cityPos = p.municipality ? CITY_POSITIONS[p.municipality] : null;
      const pos = cityPos || COUNTRY_POSITIONS[p.country] || [50, 40];
      // Add small random offset to avoid overlap
      const jitter = () => (Math.random() - 0.5) * 3;
      return {
        ...p,
        x: pos[0] + (cityPos ? 0 : jitter()),
        y: pos[1] + (cityPos ? 0 : jitter()),
      };
    });
  }, [participants]);

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="bg-certo-card rounded-xl border border-certo-card-border p-4 mb-6">
      <div className="relative w-full" style={{ paddingBottom: "60%" }}>
        <svg
          viewBox="0 0 100 70"
          className="absolute inset-0 w-full h-full"
          style={{ background: "linear-gradient(135deg, #F8F5EE 0%, #EDE8DC 100%)", borderRadius: "12px" }}
        >
          {/* EU outline hint (simplified) */}
          <text x="50" y="5" textAnchor="middle" fontSize="2.5" fill="#1A2744" opacity="0.15" fontWeight="bold">
            EUROPA
          </text>

          {/* Country labels */}
          {Object.entries(COUNTRY_POSITIONS).map(([code, [x, y]]) => {
            const count = participants.filter((p) => p.country === code).length;
            if (count === 0) return (
              <text key={code} x={x} y={y} textAnchor="middle" fontSize="1.8" fill="#1A2744" opacity="0.08">
                {code}
              </text>
            );
            return (
              <text key={code} x={x} y={y + 4} textAnchor="middle" fontSize="1.5" fill="#1A2744" opacity="0.2">
                {code}
              </text>
            );
          })}

          {/* Participant dots */}
          {dots.map((d) => {
            const isHovered = hovered === d.org_id;
            const color = d.level === "diament" ? "#C49A3C" :
                          d.level === "gold" ? "#D4A843" :
                          d.level === "silver" ? "#8B8B8B" :
                          d.level === "bronze" ? "#CD7F32" :
                          d.certo_score ? "#1A2744" : "#AAAAAA";
            const r = isHovered ? 2.2 : (d.certo_score && d.certo_score >= 80 ? 1.6 : 1.2);

            return (
              <g key={d.org_id}
                onMouseEnter={() => setHovered(d.org_id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Pulse ring for high scores */}
                {d.certo_score && d.certo_score >= 80 && (
                  <circle cx={d.x} cy={d.y} r={r + 1} fill="none" stroke={color} strokeWidth="0.2" opacity="0.3">
                    <animate attributeName="r" from={String(r)} to={String(r + 2.5)} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={d.x} cy={d.y} r={r} fill={color} stroke="white" strokeWidth="0.4" />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect x={d.x + 2} y={d.y - 5} width={28} height={8} rx="1" fill="#1A2744" opacity="0.95" />
                    <text x={d.x + 3} y={d.y - 1.5} fontSize="1.6" fill="white" fontWeight="bold">
                      {d.org_name.length > 25 ? d.org_name.slice(0, 25) + "…" : d.org_name}
                    </text>
                    <text x={d.x + 3} y={d.y + 1} fontSize="1.2" fill="#C49A3C">
                      {d.certo_score ? `Score: ${d.certo_score}` : d.municipality || ""}
                      {d.level && d.level !== "none" ? ` · ${LEVEL_INFO[d.level]?.label}` : ""}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs text-certo-fg-muted">
        {[
          { color: "#C49A3C", label: "Diament Certo" },
          { color: "#D4A843", label: "Gold" },
          { color: "#8B8B8B", label: "Silver" },
          { color: "#CD7F32", label: "Bronze" },
          { color: "#1A2744", label: "W trakcie" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  va,
  vb,
  format,
}: {
  label: string;
  va: string | number | null | undefined;
  vb: string | number | null | undefined;
  format: "score" | "number" | "percent" | "text" | "level" | "phase";
}) {
  const formatVal = (v: string | number | null | undefined) => {
    if (v == null) return "—";
    if (format === "score") return String(v);
    if (format === "number") return String(v);
    if (format === "percent") return `${v}%`;
    if (format === "level") return LEVEL_INFO[v as string]?.label || String(v);
    if (format === "phase") return PHASE_INFO[v as string]?.label || String(v);
    return String(v);
  };

  const numA = typeof va === "number" ? va : null;
  const numB = typeof vb === "number" ? vb : null;
  const highlightA = numA != null && numB != null && numA > numB;
  const highlightB = numA != null && numB != null && numB > numA;

  return (
    <>
      <div className="py-2 text-certo-fg-muted border-b border-certo-card-border/30">{label}</div>
      <div className={`py-2 text-center border-b border-certo-card-border/30 font-medium ${highlightA ? "text-emerald-600" : "text-certo-fg"}`}>
        {formatVal(va)} {highlightA && "✓"}
      </div>
      <div className={`py-2 text-center border-b border-certo-card-border/30 font-medium ${highlightB ? "text-emerald-600" : "text-certo-fg"}`}>
        {formatVal(vb)} {highlightB && "✓"}
      </div>
    </>
  );
}
