"use client";

import { useState, useCallback } from "react";
import type { TenantConfig, SurveyGroup } from "../../lib/olympiad/types";

type FormState = "idle" | "submitting" | "success" | "error";
type Step = "nip" | "org" | "team" | "population" | "confirm";

const STEPS: Step[] = ["nip", "org", "team", "population", "confirm"];

type RegistryRep = { name: string; role: string; source: string };
type RegistryData = {
  org_name: string | null;
  org_type: string | null;
  address: string | null;
  nip: string | null;
  regon: string | null;
  krs: string | null;
  representatives: RegistryRep[];
  source: string;
};

const EU_COUNTRIES = [
  { code: "PL", name: "Polska" },
  { code: "DE", name: "Deutschland" },
  { code: "FR", name: "France" },
  { code: "ES", name: "España" },
  { code: "IT", name: "Italia" },
  { code: "NL", name: "Nederland" },
  { code: "BE", name: "Belgique" },
  { code: "AT", name: "Österreich" },
  { code: "CZ", name: "Česko" },
  { code: "SK", name: "Slovensko" },
  { code: "HU", name: "Magyarország" },
  { code: "RO", name: "România" },
  { code: "BG", name: "България" },
  { code: "HR", name: "Hrvatska" },
  { code: "SI", name: "Slovenija" },
  { code: "LT", name: "Lietuva" },
  { code: "LV", name: "Latvija" },
  { code: "EE", name: "Eesti" },
  { code: "FI", name: "Suomi" },
  { code: "SE", name: "Sverige" },
  { code: "DK", name: "Danmark" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "EL", name: "Ελλάδα" },
  { code: "MT", name: "Malta" },
  { code: "LU", name: "Luxembourg" },
  { code: "CY", name: "Κύπρος" },
];

interface FormData {
  nip: string;
  org_name_full: string;      // from registry
  org_name_short: string;     // custom short name (display name)
  org_type: string;           // from registry
  org_address: string;        // from registry
  regon: string;
  krs: string;
  country: string;
  municipality: string;
  coordinator_name: string;
  coordinator_email: string;
  coordinator_phone: string;
  team_members: string;
  population: Record<string, string>;
  director_declaration: boolean;
  representative_name: string;
  representative_role: string;
  representative_from_registry: boolean;
}

interface RegisterFormProps {
  config: TenantConfig;
  locale: string;
}

export default function RegisterForm({ config, locale }: RegisterFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [step, setStep] = useState<Step>("nip");
  const [errorMsg, setErrorMsg] = useState("");
  const [nipLoading, setNipLoading] = useState(false);
  const [registry, setRegistry] = useState<RegistryData | null>(null);
  const [nipError, setNipError] = useState("");
  const [fd, setFd] = useState<FormData>({
    nip: "",
    org_name_full: "",
    org_name_short: "",
    org_type: "",
    org_address: "",
    regon: "",
    krs: "",
    country: "PL",
    municipality: "",
    coordinator_name: "",
    coordinator_email: "",
    coordinator_phone: "",
    team_members: "",
    population: Object.fromEntries(
      config.survey_groups.map((g) => [g.group_id, ""])
    ),
    director_declaration: false,
    representative_name: "",
    representative_role: "",
    representative_from_registry: false,
  });

  // NIP lookup
  async function handleNipLookup() {
    const cleanNip = fd.nip.replace(/[\s-]/g, "");
    if (cleanNip.length !== 10) return;

    setNipLoading(true);
    setNipError("");
    setRegistry(null);

    try {
      const res = await fetch(`/api/olympiad/registry-lookup?nip=${cleanNip}`);
      const data = await res.json();

      if (data.success && data.data) {
        setRegistry(data.data);
        // Auto-fill form from registry
        setFd((prev) => ({
          ...prev,
          org_name_full: data.data.org_name || "",
          org_name_short: "", // User fills this
          org_type: data.data.org_type || "",
          org_address: data.data.address || "",
          regon: data.data.regon || "",
          krs: data.data.krs || "",
          municipality: data.data.address?.split(",").pop()?.trim() || prev.municipality,
        }));
      } else {
        setNipError(data.error || "Nie znaleziono podmiotu. Możesz kontynuować wpisując dane ręcznie.");
      }
    } catch {
      setNipError("Błąd połączenia z rejestrem. Możesz kontynuować wpisując dane ręcznie.");
    } finally {
      setNipLoading(false);
    }
  }

  const t = useCallback(
    (key: Record<string, string>) =>
      key[locale] || key.en || key.pl || Object.values(key)[0] || "",
    [locale]
  );

  const isPl = locale === "pl";
  const teamAlias = t(config.team_alias);

  const stepIndex = STEPS.indexOf(step);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFd((prev) => ({ ...prev, [key]: value }));
  }

  function updatePopulation(groupId: string, value: string) {
    setFd((prev) => ({
      ...prev,
      population: { ...prev.population, [groupId]: value },
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case "nip":
        return fd.nip.replace(/[\s-]/g, "").length === 10 && (!!registry || !!nipError);
      case "org":
        return !!(fd.org_name_full && fd.org_name_short && fd.country);
      case "team":
        return !!(fd.coordinator_name && fd.coordinator_email);
      case "population":
        return config.population.required_groups.every(
          (g) => Number(fd.population[g]) > 0
        );
      case "confirm":
        return fd.director_declaration;
      default:
        return false;
    }
  }

  function nextStep() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function prevStep() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function handleSubmit() {
    if (!canProceed()) return;
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/olympiad/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: config.tenant_id,
          nip: fd.nip.replace(/[\s-]/g, ""),
          org_name: fd.org_name_short || fd.org_name_full,
          org_name_full: fd.org_name_full,
          org_name_short: fd.org_name_short,
          org_type: fd.org_type,
          org_address: fd.org_address,
          regon: fd.regon,
          krs: fd.krs,
          country: fd.country,
          municipality: fd.municipality,
          representative_name: fd.representative_name,
          representative_role: fd.representative_role,
          representative_from_registry: fd.representative_from_registry,
          coordinator_name: fd.coordinator_name,
          coordinator_email: fd.coordinator_email,
          coordinator_phone: fd.coordinator_phone,
          team_members: fd.team_members
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          declared_population: Object.fromEntries(
            Object.entries(fd.population).map(([k, v]) => [k, Number(v) || 0])
          ),
          director_declaration: fd.director_declaration,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Registration failed");
      }

      setState("success");
    } catch (e) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
    }
  }

  // Success screen
  if (state === "success") {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold mb-3">
          {isPl ? "Rejestracja zakończona!" : "Registration complete!"}
        </h2>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted mb-6 max-w-md mx-auto">
          {isPl
            ? `Twoja organizacja „${fd.org_name_short || fd.org_name_full}" została zarejestrowana w Olimpiadzie Certo. Sprawdź email (${fd.coordinator_email}) — wysłaliśmy instrukcje do rozpoczęcia Fazy I.`
            : `Your organization "${fd.org_name_short || fd.org_name_full}" has been registered for the Certo Olympiad. Check your email (${fd.coordinator_email}) — we sent instructions to start Phase I.`}
        </p>
        <div className="p-6 rounded-xl bg-certo-gold/10 dark:bg-certo-gold/5 border border-certo-gold/20 max-w-md mx-auto">
          <h3 className="font-semibold mb-2">
            {isPl ? "Co dalej?" : "What's next?"}
          </h3>
          <ol className="text-sm text-left space-y-2 text-certo-navy/70 dark:text-certo-dark-muted list-decimal pl-4">
            <li>
              {isPl
                ? "Obejrzyj 3-minutowy film wprowadzający"
                : "Watch the 3-minute intro video"}
            </li>
            <li>
              {isPl
                ? "Wygeneruj linki ankietowe dla społeczności"
                : "Generate survey links for your community"}
            </li>
            <li>
              {isPl
                ? "Rozprowadź ankiety — masz 4 tygodnie!"
                : "Distribute surveys — you have 4 weeks!"}
            </li>
          </ol>
        </div>
      </div>
    );
  }

  const inputClass =
    "block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-certo-gold/50";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= stepIndex
                  ? "bg-certo-gold text-white"
                  : "bg-gray-200 dark:bg-certo-dark-border text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  i < stepIndex
                    ? "bg-certo-gold"
                    : "bg-gray-200 dark:bg-certo-dark-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step: NIP Lookup */}
      {step === "nip" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-2">
            {isPl ? "Identyfikacja organizacji" : "Organization identification"}
          </h2>
          <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted mb-4">
            {isPl
              ? "Wpisz NIP organizacji — automatycznie pobierzemy dane z rejestru (RSPO dla szkół, KRS dla fundacji i firm)."
              : "Enter the organization's NIP — we'll automatically fetch data from the registry (RSPO for schools, KRS for NGOs and companies)."}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={fd.nip}
              onChange={(e) => { updateField("nip", e.target.value.replace(/[^\d\s-]/g, "")); setRegistry(null); setNipError(""); }}
              className={`${inputClass} flex-1 font-mono text-lg tracking-wider`}
              placeholder="NIP: 000-000-00-00"
              maxLength={13}
            />
            <button
              onClick={handleNipLookup}
              disabled={nipLoading || fd.nip.replace(/[\s-]/g, "").length !== 10}
              className="px-6 py-3 bg-certo-gold text-white text-sm font-bold rounded-lg hover:bg-certo-gold-light transition disabled:opacity-50"
            >
              {nipLoading ? "⏳" : "🔍 Sprawdź"}
            </button>
          </div>

          {/* Registry result */}
          {registry && (
            <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{registry.org_name}</h3>
                  {registry.org_type && <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">{registry.org_type}</p>}
                  {registry.address && <p className="text-xs text-certo-navy/40 dark:text-certo-dark-muted mt-1">📍 {registry.address}</p>}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                  ✓ {registry.source === "rspo" ? "RSPO" : "KRS"}
                </span>
              </div>

              {/* Registry IDs */}
              <div className="flex flex-wrap gap-3 text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                {registry.nip && <span>NIP: {registry.nip}</span>}
                {registry.regon && <span>REGON: {registry.regon}</span>}
                {registry.krs && <span>KRS: {registry.krs}</span>}
              </div>

              {/* Representatives */}
              {registry.representatives.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-certo-navy/60 dark:text-certo-dark-muted mb-2">
                    {isPl ? "Władze podmiotu (z rejestru):" : "Organization authorities (from registry):"}
                  </p>
                  <div className="space-y-1">
                    {registry.representatives.map((rep, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-white/50 dark:bg-certo-dark-surface">
                        <span className="text-emerald-500">👤</span>
                        <span className="font-medium">{rep.name}</span>
                        <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">— {rep.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {isPl ? "Dane pobrane z rejestru. Kliknij Dalej, aby uzupełnić szczegóły." : "Data fetched from registry. Click Next to fill in details."}
              </p>
            </div>
          )}

          {/* NIP error — allow manual entry */}
          {nipError && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">⚠️ {nipError}</p>
              <p className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                {isPl ? "Kliknij Dalej, aby wpisać dane ręcznie." : "Click Next to enter data manually."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step: Organization details (auto-filled + short name) */}
      {step === "org" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {isPl ? "Dane organizacji" : "Organization details"}
          </h2>

          {/* Full name (from registry or manual) */}
          <label className={labelClass}>
            {isPl ? "Pełna nazwa organizacji *" : "Full organization name *"}
            <input
              type="text"
              value={fd.org_name_full}
              onChange={(e) => updateField("org_name_full", e.target.value)}
              placeholder={isPl ? "np. Szkoła Podstawowa nr 15 im. Jana Pawła II w Warszawie" : "e.g. Primary School No. 15"}
              className={`${inputClass} ${registry ? "bg-emerald-50/30 dark:bg-emerald-900/5" : ""}`}
            />
            {registry && (
              <span className="text-[10px] text-emerald-600">✓ {isPl ? "Z rejestru" : "From registry"}</span>
            )}
          </label>

          {/* Short name (user's choice — this is the display name) */}
          <label className={labelClass}>
            <span className="flex items-center gap-2">
              {isPl ? "Nazwa skrócona (wyświetlana) *" : "Short name (displayed) *"}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-certo-gold/10 text-certo-gold font-medium">
                {isPl ? "Twoja nazwa własna" : "Your custom name"}
              </span>
            </span>
            <input
              type="text"
              value={fd.org_name_short}
              onChange={(e) => updateField("org_name_short", e.target.value)}
              placeholder={isPl ? "np. SP 15 Warszawa, Jedynka, Nasza Szkoła" : "e.g. School 15, Our School"}
              className={inputClass}
            />
            <span className="text-[10px] text-certo-navy/40 dark:text-certo-dark-muted">
              {isPl ? "Ta nazwa będzie widoczna w wynikach, rankingach i na stronie uczestników." : "This name will be visible in results, rankings and on the participants page."}
            </span>
          </label>

          {/* Address */}
          <label className={labelClass}>
            {isPl ? "Adres" : "Address"}
            <input
              type="text"
              value={fd.org_address}
              onChange={(e) => updateField("org_address", e.target.value)}
              placeholder={isPl ? "np. ul. Szkolna 5, 00-001 Warszawa" : "e.g. 5 School St, 00-001 Warsaw"}
              className={`${inputClass} ${registry ? "bg-emerald-50/30 dark:bg-emerald-900/5" : ""}`}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={labelClass}>
              {isPl ? "Kraj *" : "Country *"}
              <select
                value={fd.country}
                onChange={(e) => updateField("country", e.target.value)}
                className={inputClass}
              >
                {EU_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              {isPl ? "Gmina / miasto" : "Municipality / city"}
              <input
                type="text"
                value={fd.municipality}
                onChange={(e) => updateField("municipality", e.target.value)}
                placeholder={isPl ? "np. Warszawa" : "e.g. Berlin"}
                className={inputClass}
              />
            </label>
          </div>

          {/* Representative from registry */}
          {registry && registry.representatives.length > 0 && (
            <div className="rounded-xl border border-certo-navy/10 dark:border-certo-dark-border p-4">
              <p className="text-xs font-medium text-certo-navy/60 dark:text-certo-dark-muted mb-2">
                {isPl ? "Reprezentant podmiotu (osoba zatwierdzająca):" : "Organization representative (approver):"}
              </p>
              <div className="space-y-2">
                {registry.representatives.map((rep, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { updateField("representative_name", rep.name); updateField("representative_role", rep.role); updateField("representative_from_registry", true); }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      fd.representative_name === rep.name
                        ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-certo-navy/10 dark:border-certo-dark-border hover:border-certo-gold/50"
                    }`}
                  >
                    <span className="font-medium text-sm">{rep.name}</span>
                    <span className="ml-2 text-xs text-certo-navy/50 dark:text-certo-dark-muted">{rep.role}</span>
                    {fd.representative_name === rep.name && <span className="ml-2 text-emerald-500 text-xs">✓</span>}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { updateField("representative_name", ""); updateField("representative_role", ""); updateField("representative_from_registry", false); }}
                  className={`w-full text-left p-3 rounded-lg border-2 border-dashed transition ${
                    !fd.representative_from_registry && fd.representative_name === ""
                      ? "border-certo-gold bg-certo-gold/5"
                      : "border-certo-navy/20 dark:border-certo-dark-border hover:border-certo-gold/50"
                  }`}
                >
                  <span className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
                    👤 {isPl ? "Inna osoba (pełnomocnik, nowa dyrekcja)" : "Other person (proxy, new management)"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Team */}
      {step === "team" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {isPl ? `Koordynator i ${teamAlias}` : `Coordinator & ${teamAlias}`}
          </h2>

          <label className={labelClass}>
            {isPl ? "Imię i nazwisko koordynatora *" : "Coordinator name *"}
            <input
              type="text"
              value={fd.coordinator_name}
              onChange={(e) =>
                updateField("coordinator_name", e.target.value)
              }
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            {isPl ? "Email koordynatora *" : "Coordinator email *"}
            <input
              type="email"
              value={fd.coordinator_email}
              onChange={(e) =>
                updateField("coordinator_email", e.target.value)
              }
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            {isPl ? "Telefon koordynatora" : "Coordinator phone"}
            <input
              type="tel"
              value={fd.coordinator_phone}
              onChange={(e) =>
                updateField("coordinator_phone", e.target.value)
              }
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            {isPl
              ? `Członkowie ${teamAlias} (3–5 osób, oddzielone przecinkami)`
              : `${teamAlias} members (3–5 people, comma-separated)`}
            <textarea
              value={fd.team_members}
              onChange={(e) => updateField("team_members", e.target.value)}
              rows={3}
              placeholder={
                isPl
                  ? "np. Jan Kowalski, Anna Nowak, Piotr Wiśniewski"
                  : "e.g. John Smith, Jane Doe, Bob Wilson"
              }
              className={inputClass}
            />
          </label>
        </div>
      )}

      {/* Step: Population */}
      {step === "population" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-2">
            {isPl ? "Deklaracja populacji" : "Population declaration"}
          </h2>
          <p className="text-sm text-certo-navy/60 dark:text-certo-dark-muted mb-4">
            {isPl
              ? "Podaj liczbę osób w każdej grupie. Te dane służą do obliczenia progów partycypacji."
              : "Enter the number of people in each group. Used to calculate participation thresholds."}
          </p>

          {config.survey_groups.map((group: SurveyGroup) => {
            const isRequired =
              config.population.required_groups.includes(group.group_id);
            const threshold = config.thresholds[group.group_id];
            return (
              <label key={group.group_id} className={labelClass}>
                {t(group.name)} {isRequired ? "*" : ""}
                {threshold && (
                  <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                    (min. {threshold.min_pct}%{" "}
                    {isPl ? "partycypacji" : "participation"})
                  </span>
                )}
                <input
                  type="number"
                  min={0}
                  value={fd.population[group.group_id]}
                  onChange={(e) =>
                    updatePopulation(group.group_id, e.target.value)
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </label>
            );
          })}
        </div>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {isPl ? "Podsumowanie i potwierdzenie" : "Summary & confirmation"}
          </h2>

          <div className="space-y-3 p-4 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border">
            <div>
              <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                {isPl ? "Organizacja" : "Organization"}
              </span>
              <div className="font-semibold">{fd.org_name_short || fd.org_name_full}</div>
              {fd.org_name_short && fd.org_name_full && fd.org_name_short !== fd.org_name_full && (
                <div className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">{fd.org_name_full}</div>
              )}
            </div>
            <div>
              <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                {isPl ? "Kraj" : "Country"}
              </span>
              <div className="font-semibold">
                {EU_COUNTRIES.find((c) => c.code === fd.country)?.name ||
                  fd.country}
              </div>
            </div>
            <div>
              <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                {isPl ? "Koordynator" : "Coordinator"}
              </span>
              <div className="font-semibold">
                {fd.coordinator_name} ({fd.coordinator_email})
              </div>
            </div>
            <div>
              <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                {isPl ? "Populacja" : "Population"}
              </span>
              <div className="font-semibold">
                {config.survey_groups
                  .filter((g) => Number(fd.population[g.group_id]) > 0)
                  .map(
                    (g) => `${t(g.name)}: ${fd.population[g.group_id]}`
                  )
                  .join(" · ")}
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border cursor-pointer">
            <input
              type="checkbox"
              checked={fd.director_declaration}
              onChange={(e) =>
                updateField("director_declaration", e.target.checked)
              }
              className="mt-1 w-5 h-5 rounded border-certo-navy/30 text-certo-gold focus:ring-certo-gold"
            />
            <span className="text-sm">
              {isPl
                ? "Oświadczam, że podane dane o populacji są zgodne ze stanem faktycznym. Jestem upoważniony/a do reprezentowania organizacji w Olimpiadzie Certo."
                : "I declare that the population data provided is accurate. I am authorized to represent the organization in the Certo Olympiad."}
            </span>
          </label>

          {state === "error" && errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {!isFirst ? (
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl border border-certo-navy/20 dark:border-certo-dark-border text-sm font-medium hover:bg-gray-50 dark:hover:bg-certo-dark-surface transition-colors"
          >
            {isPl ? "← Wstecz" : "← Back"}
          </button>
        ) : (
          <div />
        )}

        {!isLast ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="px-6 py-3 rounded-xl bg-certo-gold text-white font-medium hover:bg-certo-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPl ? "Dalej →" : "Next →"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || state === "submitting"}
            className="px-8 py-3 rounded-xl bg-certo-gold text-white font-bold hover:bg-certo-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "submitting"
              ? isPl
                ? "Rejestracja..."
                : "Registering..."
              : isPl
                ? "Zarejestruj organizację"
                : "Register organization"}
          </button>
        )}
      </div>
    </div>
  );
}
