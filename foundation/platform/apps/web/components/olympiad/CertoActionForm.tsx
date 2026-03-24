"use client";

import { useState, useCallback } from "react";
import type { Pillar } from "../../lib/olympiad/types";

// ── Team member types ─────────────────────────────────────
type ActionRole = "team-action" | "expert-action" | "obserwator-action";
type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: ActionRole;
  affiliation: string;
  status: "invited" | "active" | "declined";
};

const ROLE_INFO: Record<ActionRole, { label: Record<string, string>; icon: string; description: Record<string, string>; canEdit: boolean }> = {
  "team-action": {
    label: { pl: "Członek zespołu", en: "Team Member" },
    icon: "👥",
    description: { pl: "Pracuje nad planem stacjonarnie i online. Może edytować.", en: "Works on the plan on-site and online. Can edit." },
    canEdit: true,
  },
  "expert-action": {
    label: { pl: "Ekspert zewnętrzny", en: "External Expert" },
    icon: "🎓",
    description: { pl: "Zaproszony ekspert — doradza, sugeruje, edytuje.", en: "Invited expert — advises, suggests, edits." },
    canEdit: true,
  },
  "obserwator-action": {
    label: { pl: "Obserwator", en: "Observer" },
    icon: "👁️",
    description: { pl: "Media, dyrekcja, rodzice — widzi plan, komentuje.", en: "Media, management, parents — views plan, comments." },
    canEdit: false,
  },
};

// ── Step with timeline + proof ────────────────────────────
type StepStatus = "planned" | "in-progress" | "completed";
type ActionStep = {
  text: string;
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  status: StepStatus;
  proof: string;      // URL or description of evidence
};

const STEP_STATUS: Record<StepStatus, { label: Record<string, string>; icon: string; color: string }> = {
  planned: { label: { pl: "Zaplanowany", en: "Planned" }, icon: "📋", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  "in-progress": { label: { pl: "W realizacji", en: "In progress" }, icon: "⚡", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  completed: { label: { pl: "Zrealizowany", en: "Completed" }, icon: "✅", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
};

interface Template {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  steps: Record<string, string>[];
  metrics: Record<string, string>[];
}

interface CertoActionFormProps {
  locale: string;
  tenantSlug: string;
  weakestPillar: Pillar;
  templates: Template[];
  maxSteps: number;
  maxWords: number;
}

export default function CertoActionForm({
  locale,
  tenantSlug,
  weakestPillar,
  templates,
  maxSteps,
  maxWords,
}: CertoActionFormProps) {
  // Multi-plan state — each "kwestia" has its own title, description, steps, metrics
  type ActionPlan = {
    id: string;
    title: string;
    whatToChange: string;
    steps: ActionStep[];
    metrics: string[];
    showRoadmap: boolean;
  };

  const [plans, setPlans] = useState<ActionPlan[]>([
    { id: "1", title: "", whatToChange: "", steps: [{ text: "", startDate: "", endDate: "", status: "planned", proof: "" }], metrics: [""], showRoadmap: false },
  ]);
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [directorConsulted, setDirectorConsulted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helpers to update active plan
  function updatePlan(idx: number, updates: Partial<ActionPlan>) {
    setPlans((prev) => prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
  }
  function addPlan() {
    setPlans((prev) => [...prev, {
      id: String(Date.now()),
      title: "",
      whatToChange: "",
      steps: [{ text: "", startDate: "", endDate: "", status: "planned", proof: "" }],
      metrics: [""],
      showRoadmap: false,
    }]);
    setActivePlanIdx(plans.length);
  }
  function removePlan(idx: number) {
    if (plans.length <= 1) return;
    setPlans((prev) => prev.filter((_, i) => i !== idx));
    setActivePlanIdx(Math.max(0, activePlanIdx - 1));
  }

  // Team collaboration
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ActionRole>("team-action");
  const [inviteAffiliation, setInviteAffiliation] = useState("");

  const addTeamMember = useCallback(() => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    const member: TeamMember = {
      id: Date.now().toString(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      affiliation: inviteAffiliation.trim(),
      status: "invited",
    };
    setTeamMembers((prev) => [...prev, member]);
    setInviteName("");
    setInviteEmail("");
    setInviteAffiliation("");
    setShowInviteForm(false);
  }, [inviteName, inviteEmail, inviteRole, inviteAffiliation]);

  const removeTeamMember = useCallback((id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const isPl = locale === "pl";
  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  // Step helpers for active plan
  const plan = plans[activePlanIdx];

  function addStep() {
    const newSteps = [...plan.steps, { text: "", startDate: "", endDate: "", status: "planned" as StepStatus, proof: "" }];
    if (newSteps.length <= maxSteps) updatePlan(activePlanIdx, { steps: newSteps });
  }
  function updateStepField(i: number, field: keyof ActionStep, val: string) {
    const newSteps = plan.steps.map((s, idx) => (idx === i ? { ...s, [field]: val } : s));
    updatePlan(activePlanIdx, { steps: newSteps });
  }
  function removeStep(i: number) {
    if (plan.steps.length > 1) updatePlan(activePlanIdx, { steps: plan.steps.filter((_, idx) => idx !== i) });
  }

  function addMetric() {
    if (plan.metrics.length < 3) updatePlan(activePlanIdx, { metrics: [...plan.metrics, ""] });
  }
  function updateMetric(i: number, val: string) {
    updatePlan(activePlanIdx, { metrics: plan.metrics.map((m, idx) => (idx === i ? val : m)) });
  }

  const wordCount = plan.whatToChange.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit =
    plans.every((p) => p.title.trim() && p.whatToChange.trim() && p.steps.filter((s) => s.text.trim()).length >= 1) &&
    directorConsulted;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    // In production: POST to /api/olympiad/action
    console.log("[Certo Action]", {
      tenant_id: tenantSlug,
      weakest_pillar: weakestPillar.id,
      plans: plans.map((p) => ({
        title: p.title,
        what_to_change: p.whatToChange,
        steps: p.steps.filter((s) => s.text.trim()).map((s) => ({
          text: s.text,
          start_date: s.startDate,
          end_date: s.endDate,
          status: s.status,
          proof: s.proof,
        })),
        success_metrics: p.metrics.filter((m) => m.trim()),
      })),
      director_consulted: directorConsulted,
      team_members: teamMembers.map((m) => ({
        name: m.name,
        email: m.email,
        role: m.role,
        affiliation: m.affiliation,
      })),
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🚀</div>
        <h2 className="text-2xl font-bold mb-3">
          {isPl ? "Certo Action wysłany!" : "Certo Action submitted!"}
        </h2>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted max-w-md mx-auto">
          {isPl
            ? "Twój plan poprawy został przesłany do oceny. Inne organizacje ocenią go w ramach Peer-Review."
            : "Your improvement plan has been submitted for review. Other organizations will evaluate it in Peer-Review."}
        </p>
      </div>
    );
  }

  const inputClass =
    "block w-full rounded-lg border border-certo-navy/20 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-certo-gold/50";

  return (
    <div className="space-y-8">
      {/* Weakest pillar banner */}
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-center">
        <span className="text-sm font-medium">
          {isPl ? "Najsłabszy filar:" : "Weakest pillar:"}{" "}
          <strong>{t(weakestPillar.friendly_name)}</strong>
          <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted ml-2">
            ({t(weakestPillar.name)})
          </span>
        </span>
      </div>

      {/* Plan tabs */}
      <section>
        <h2 className="font-bold mb-3">
          {isPl ? "1. Co chcemy zmienić?" : "1. What do we want to change?"}
        </h2>
        <p className="text-xs text-certo-navy/40 dark:text-certo-dark-muted mb-4">
          {isPl
            ? "Każda kwestia to osobny plan zmian z własną Drogą do Zmiany. Możesz dodać wiele kwestii."
            : "Each issue is a separate change plan with its own Road to Change. You can add multiple issues."}
        </p>

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {plans.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePlanIdx(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                activePlanIdx === idx
                  ? "bg-certo-gold text-white font-bold"
                  : "bg-certo-navy/5 dark:bg-certo-dark-border text-certo-navy/60 dark:text-certo-dark-muted hover:bg-certo-navy/10"
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{p.title || (isPl ? `Kwestia ${idx + 1}` : `Issue ${idx + 1}`)}</span>
              {plans.length > 1 && activePlanIdx === idx && (
                <span
                  onClick={(e) => { e.stopPropagation(); removePlan(idx); }}
                  className="ml-1 text-white/60 hover:text-white"
                >✕</span>
              )}
            </button>
          ))}
          <button
            onClick={addPlan}
            className="px-4 py-2 rounded-lg text-sm border-2 border-dashed border-certo-navy/20 dark:border-certo-dark-border text-certo-gold font-medium hover:border-certo-gold transition whitespace-nowrap"
          >
            + {isPl ? "Dodaj kwestię" : "Add issue"}
          </button>
        </div>
      </section>

      {/* Active plan editor */}
      {plan && (
        <>
          {/* Plan title */}
          <section>
            <label className="font-bold text-sm mb-2 block">
              {isPl ? "Nazwa kwestii" : "Issue name"}
            </label>
            <input
              type="text"
              value={plan.title}
              onChange={(e) => updatePlan(activePlanIdx, { title: e.target.value })}
              className={inputClass}
              placeholder={isPl ? "np. Transparentność budżetu, Komunikacja z rodzicami" : "e.g. Budget transparency, Parent communication"}
            />
          </section>

          {/* What to change */}
          <section>
            <h2 className="font-bold mb-3">
              {isPl ? "2. Co chcemy zmienić?" : "2. What do we want to change?"}
              <span className="text-xs font-normal text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                ({wordCount}/{maxWords} {isPl ? "słów" : "words"})
              </span>
            </h2>
            <textarea
              value={plan.whatToChange}
              onChange={(e) => updatePlan(activePlanIdx, { whatToChange: e.target.value })}
              rows={3}
              className={`${inputClass} ${wordCount > maxWords ? "border-red-400" : ""}`}
              placeholder={isPl ? "Opisz, co chcesz zmienić w tej kwestii..." : "Describe what you want to change..."}
            />
          </section>

          {/* Steps + Roadmap */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">
                {isPl ? "3. Droga do zmiany" : "3. Road to change"}
                <span className="text-xs font-normal text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                  (max {maxSteps} {isPl ? "kroków" : "steps"})
                </span>
              </h2>
              <button
                onClick={() => updatePlan(activePlanIdx, { showRoadmap: !plan.showRoadmap })}
                className="text-xs px-3 py-1 rounded-full bg-certo-gold/10 text-certo-gold font-medium hover:bg-certo-gold/20 transition"
              >
                {plan.showRoadmap
                  ? (isPl ? "📝 Edycja" : "📝 Edit")
                  : (isPl ? "🗺️ Roadmapa" : "🗺️ Roadmap")}
              </button>
            </div>

            {plan.showRoadmap ? (
              /* ── Roadmap Timeline View ── */
              <div className="relative pl-8 space-y-6">
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-certo-gold via-certo-gold/50 to-certo-navy/20 dark:to-certo-dark-border rounded-full" />

                {plan.steps.map((step, i) => {
                  const statusInfo = STEP_STATUS[step.status];
                  const hasProof = step.proof.trim().length > 0;
                  return (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white dark:border-certo-dark-card ${
                        step.status === "completed" ? "bg-emerald-500 text-white" :
                        step.status === "in-progress" ? "bg-blue-500 text-white" :
                        "bg-gray-200 text-gray-500 dark:bg-gray-700"
                      }`}>
                        {step.status === "completed" ? "✓" : i + 1}
                      </div>

                      <div className={`rounded-xl border-2 p-4 transition ${
                        step.status === "completed" ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10" :
                        step.status === "in-progress" ? "border-blue-200 bg-blue-50/50 dark:border-blue-800/30 dark:bg-blue-900/10" :
                        "border-certo-navy/10 dark:border-certo-dark-border"
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm flex-1">
                            {step.text || (isPl ? `Krok ${i + 1}` : `Step ${i + 1}`)}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label[locale] || statusInfo.label.en}
                          </span>
                        </div>

                        {/* Dates */}
                        {(step.startDate || step.endDate) && (
                          <div className="flex items-center gap-2 text-xs text-certo-navy/50 dark:text-certo-dark-muted mb-2">
                            {step.startDate && (
                              <span>🚀 {isPl ? "Start" : "Start"}: {new Date(step.startDate).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            )}
                            {step.startDate && step.endDate && <span>→</span>}
                            {step.endDate && (
                              <span>🏁 {isPl ? "Cel" : "Target"}: {new Date(step.endDate).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            )}
                          </div>
                        )}

                        {/* Proof of completion */}
                        {step.status === "completed" && hasProof && (
                          <div className="mt-2 p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-400">
                            📎 {isPl ? "Dowód realizacji" : "Proof of completion"}: {step.proof}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── Edit View ── */
              <div className="space-y-4">
                {plan.steps.map((step, i) => (
                  <div key={i} className="rounded-xl border border-certo-navy/10 dark:border-certo-dark-border p-4 space-y-3">
                    {/* Step header */}
                    <div className="flex gap-2 items-start">
                      <span className="w-6 h-8 flex items-center justify-center text-xs font-bold text-certo-gold shrink-0">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={step.text}
                        onChange={(e) => updateStepField(i, "text", e.target.value)}
                        className={`${inputClass} flex-1`}
                        placeholder={isPl ? `Co zrobimy w kroku ${i + 1}?` : `What will we do in step ${i + 1}?`}
                      />
                      {plan.steps.length > 1 && (
                        <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 text-sm px-1 shrink-0">✕</button>
                      )}
                    </div>

                    {/* Dates row */}
                    <div className="grid grid-cols-2 gap-3 pl-8">
                      <div>
                        <label className="text-xs text-certo-navy/40 dark:text-certo-dark-muted mb-1 block">
                          🚀 {isPl ? "Ruszamy" : "We start"}
                        </label>
                        <input
                          type="date"
                          value={step.startDate}
                          onChange={(e) => updateStepField(i, "startDate", e.target.value)}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-certo-navy/40 dark:text-certo-dark-muted mb-1 block">
                          🏁 {isPl ? "Cel osiągnięty do" : "Target achieved by"}
                        </label>
                        <input
                          type="date"
                          value={step.endDate}
                          onChange={(e) => updateStepField(i, "endDate", e.target.value)}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                    </div>

                    {/* Status + Proof (for coordinator to update later) */}
                    <div className="pl-8 flex flex-wrap items-center gap-3">
                      <select
                        value={step.status}
                        onChange={(e) => updateStepField(i, "status", e.target.value)}
                        className={`${inputClass} w-auto text-xs`}
                      >
                        {(Object.entries(STEP_STATUS) as [StepStatus, typeof STEP_STATUS[StepStatus]][]).map(([id, info]) => (
                          <option key={id} value={id}>
                            {info.icon} {info.label[locale] || info.label.en}
                          </option>
                        ))}
                      </select>

                      {step.status === "completed" && (
                        <input
                          type="text"
                          value={step.proof}
                          onChange={(e) => updateStepField(i, "proof", e.target.value)}
                          className={`${inputClass} flex-1 text-xs`}
                          placeholder={isPl ? "📎 Dowód: link, opis lub załącznik" : "📎 Proof: link, description or attachment"}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {plan.steps.length < maxSteps && (
                  <button onClick={addStep} className="text-xs text-certo-gold font-medium">
                    + {isPl ? "Dodaj kolejny krok" : "Add another step"}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Metrics */}
          <section>
            <h2 className="font-bold mb-3">
              {isPl ? "4. Jak zmierzymy sukces?" : "4. How will we measure success?"}
            </h2>
            <div className="space-y-2">
              {plan.metrics.map((metric, i) => (
                <input
                  key={i}
                  type="text"
                  value={metric}
                  onChange={(e) => updateMetric(i, e.target.value)}
                  className={inputClass}
                  placeholder={isPl ? `Wskaźnik ${i + 1}` : `Metric ${i + 1}`}
                />
              ))}
              {plan.metrics.length < 3 && (
                <button onClick={addMetric} className="text-xs text-certo-gold font-medium">
                  + {isPl ? "Dodaj wskaźnik" : "Add metric"}
                </button>
              )}
            </div>
          </section>

          {/* Team collaboration */}
          <section>
            <h2 className="font-bold mb-3">
              {isPl ? "5. Zespół Certo Action" : "5. Certo Action Team"}
              <span className="text-xs font-normal text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                ({isPl ? "opcjonalnie" : "optional"})
              </span>
            </h2>
            <p className="text-xs text-certo-navy/50 dark:text-certo-dark-muted mb-4">
              {isPl
                ? "Zaproś osoby do współpracy nad Certo Action — członków zespołu, ekspertów zewnętrznych lub obserwatorów (media, dyrekcja)."
                : "Invite people to collaborate on Certo Action — team members, external experts, or observers (media, management)."}
            </p>

            {/* Existing team members */}
            {teamMembers.length > 0 && (
              <div className="space-y-2 mb-4">
                {teamMembers.map((m) => {
                  const roleInfo = ROLE_INFO[m.role];
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface"
                    >
                      <span className="text-lg">{roleInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{m.name}</div>
                        <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted truncate">
                          {m.email}
                          {m.affiliation && ` · ${m.affiliation}`}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.role === "team-action" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                        m.role === "expert-action" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" :
                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {roleInfo.label[locale] || roleInfo.label.en}
                      </span>
                      <span className={`text-xs ${
                        m.status === "active" ? "text-emerald-500" :
                        m.status === "declined" ? "text-red-500" :
                        "text-certo-gold"
                      }`}>
                        {m.status === "active" ? "✓" : m.status === "declined" ? "✕" : "⏳"}
                      </span>
                      <button
                        onClick={() => removeTeamMember(m.id)}
                        className="text-red-400 hover:text-red-600 text-xs px-1"
                        title={isPl ? "Usuń" : "Remove"}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Invite form */}
            {showInviteForm ? (
              <div className="p-4 rounded-xl border-2 border-certo-gold/30 bg-certo-gold/5 dark:bg-certo-gold/10 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className={inputClass}
                    placeholder={isPl ? "Imię i nazwisko" : "Full name"}
                  />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className={inputClass}
                    placeholder={isPl ? "Adres e-mail" : "Email address"}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ActionRole)}
                    className={inputClass}
                  >
                    {(Object.entries(ROLE_INFO) as [ActionRole, typeof ROLE_INFO[ActionRole]][]).map(
                      ([roleId, info]) => (
                        <option key={roleId} value={roleId}>
                          {info.icon} {info.label[locale] || info.label.en}
                          {info.canEdit ? (isPl ? " (edycja)" : " (edit)") : (isPl ? " (podgląd)" : " (view)")}
                        </option>
                      )
                    )}
                  </select>
                  <input
                    type="text"
                    value={inviteAffiliation}
                    onChange={(e) => setInviteAffiliation(e.target.value)}
                    className={inputClass}
                    placeholder={isPl ? "Afiliacja, np. Gazeta Lokalna" : "Affiliation, e.g. Local News"}
                  />
                </div>
                {/* Role description */}
                <p className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                  {ROLE_INFO[inviteRole].description[locale] || ROLE_INFO[inviteRole].description.en}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={addTeamMember}
                    disabled={!inviteName.trim() || !inviteEmail.trim()}
                    className="px-4 py-2 bg-certo-gold text-white text-sm font-medium rounded-lg hover:bg-certo-gold-light transition disabled:opacity-50"
                  >
                    {isPl ? "Zaproś" : "Invite"}
                  </button>
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 text-sm text-certo-navy/50 dark:text-certo-dark-muted"
                  >
                    {isPl ? "Anuluj" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowInviteForm(true)}
                className="w-full p-3 rounded-xl border-2 border-dashed border-certo-navy/20 dark:border-certo-dark-border hover:border-certo-gold hover:bg-certo-gold/5 transition text-sm text-certo-navy/50 dark:text-certo-dark-muted font-medium"
              >
                + {isPl ? "Zaproś osobę do zespołu" : "Invite a person to the team"}
              </button>
            )}

            {/* Role legend */}
            <div className="mt-3 flex flex-wrap gap-4">
              {(Object.entries(ROLE_INFO) as [ActionRole, typeof ROLE_INFO[ActionRole]][]).map(
                ([roleId, info]) => (
                  <div key={roleId} className="flex items-center gap-1 text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                    <span>{info.icon}</span>
                    <span>{info.label[locale] || info.label.en}</span>
                    <span>— {info.canEdit ? (isPl ? "edytuje" : "edits") : (isPl ? "obserwuje" : "views")}</span>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Director consultation */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border cursor-pointer">
            <input
              type="checkbox"
              checked={directorConsulted}
              onChange={(e) => setDirectorConsulted(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-certo-navy/30 text-certo-gold focus:ring-certo-gold"
            />
            <span className="text-sm">
              {isPl
                ? "6. Plan został skonsultowany z dyrekcją/kierownictwem organizacji"
                : "6. This plan has been consulted with the organization's management"}
            </span>
          </label>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="px-8 py-4 bg-certo-gold text-white font-bold rounded-xl text-lg hover:bg-certo-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? isPl ? "Wysyłanie..." : "Submitting..."
                : isPl ? "Wyślij Certo Action" : "Submit Certo Action"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
