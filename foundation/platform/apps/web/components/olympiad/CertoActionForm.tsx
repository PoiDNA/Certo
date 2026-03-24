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
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [whatToChange, setWhatToChange] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [metrics, setMetrics] = useState<string[]>([""]);
  const [directorConsulted, setDirectorConsulted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  function selectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && tmpl.id !== "custom") {
      setWhatToChange(t(tmpl.description));
      setSteps(tmpl.steps.map((s) => t(s)));
      setMetrics(tmpl.metrics.map((m) => t(m)));
    } else {
      setWhatToChange("");
      setSteps([""]);
      setMetrics([""]);
    }
  }

  function addStep() {
    if (steps.length < maxSteps) setSteps([...steps, ""]);
  }
  function updateStep(i: number, val: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? val : s)));
  }
  function removeStep(i: number) {
    if (steps.length > 1) setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addMetric() {
    if (metrics.length < 3) setMetrics([...metrics, ""]);
  }
  function updateMetric(i: number, val: string) {
    setMetrics((prev) => prev.map((m, idx) => (idx === i ? val : m)));
  }

  const wordCount = whatToChange.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit =
    whatToChange.trim() &&
    steps.filter((s) => s.trim()).length >= 1 &&
    metrics.filter((m) => m.trim()).length >= 1 &&
    directorConsulted &&
    wordCount <= maxWords;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    // In production: POST to /api/olympiad/action
    console.log("[Certo Action]", {
      tenant_id: tenantSlug,
      weakest_pillar: weakestPillar.id,
      template_used: selectedTemplate,
      what_to_change: whatToChange,
      steps: steps.filter((s) => s.trim()),
      success_metrics: metrics.filter((m) => m.trim()),
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

      {/* Template selection */}
      <section>
        <h2 className="font-bold mb-3">
          {isPl ? "1. Wybierz szablon lub stwórz własny plan" : "1. Choose a template or create your own"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => selectTemplate(tmpl.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selectedTemplate === tmpl.id
                  ? "border-certo-gold bg-certo-gold/5"
                  : "border-certo-navy/10 dark:border-certo-dark-border hover:border-certo-navy/20"
              }`}
            >
              <div className="font-semibold text-sm mb-1">{t(tmpl.title)}</div>
              <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
                {t(tmpl.description)}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* What to change */}
      {selectedTemplate && (
        <>
          <section>
            <h2 className="font-bold mb-3">
              {isPl ? "2. Co chcemy zmienić?" : "2. What do we want to change?"}
              <span className="text-xs font-normal text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                ({wordCount}/{maxWords} {isPl ? "słów" : "words"})
              </span>
            </h2>
            <textarea
              value={whatToChange}
              onChange={(e) => setWhatToChange(e.target.value)}
              rows={4}
              className={`${inputClass} ${wordCount > maxWords ? "border-red-400" : ""}`}
              placeholder={isPl ? "Opisz, co chcesz zmienić..." : "Describe what you want to change..."}
            />
          </section>

          {/* Steps */}
          <section>
            <h2 className="font-bold mb-3">
              {isPl ? "3. Jak to zrobimy?" : "3. How will we do it?"}
              <span className="text-xs font-normal text-certo-navy/40 dark:text-certo-dark-muted ml-2">
                (max {maxSteps} {isPl ? "kroków" : "steps"})
              </span>
            </h2>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-6 h-10 flex items-center justify-center text-xs font-bold text-certo-gold">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder={isPl ? `Krok ${i + 1}` : `Step ${i + 1}`}
                  />
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(i)}
                      className="text-red-400 hover:text-red-600 text-sm px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {steps.length < maxSteps && (
                <button onClick={addStep} className="text-xs text-certo-gold font-medium">
                  + {isPl ? "Dodaj krok" : "Add step"}
                </button>
              )}
            </div>
          </section>

          {/* Metrics */}
          <section>
            <h2 className="font-bold mb-3">
              {isPl ? "4. Jak zmierzymy sukces?" : "4. How will we measure success?"}
            </h2>
            <div className="space-y-2">
              {metrics.map((metric, i) => (
                <input
                  key={i}
                  type="text"
                  value={metric}
                  onChange={(e) => updateMetric(i, e.target.value)}
                  className={inputClass}
                  placeholder={isPl ? `Wskaźnik ${i + 1}` : `Metric ${i + 1}`}
                />
              ))}
              {metrics.length < 3 && (
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
