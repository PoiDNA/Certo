"use client";

import { useState } from "react";
import type { Pillar } from "../../lib/olympiad/types";

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
                ? "5. Plan został skonsultowany z dyrekcją/kierownictwem organizacji"
                : "5. This plan has been consulted with the organization's management"}
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
