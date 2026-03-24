"use client";

import { useState } from "react";

interface ActionToReview {
  weakest_pillar: string;
  what_to_change: string;
  steps: string[];
  success_metrics: string[];
  template_used: string | null;
}

interface PeerReviewClientProps {
  locale: string;
  tenantSlug: string;
  action: ActionToReview;
  pillarFriendlyName: string;
  pillarName: string;
}

const REVIEW_CRITERIA = [
  {
    id: "clear",
    label: { pl: "Czy plan jest jasny i zrozumiały?", en: "Is the plan clear and understandable?" },
    hint: { pl: "Czy po przeczytaniu wiesz, co organizacja chce osiągnąć?", en: "After reading, do you know what the organization wants to achieve?" },
  },
  {
    id: "concrete",
    label: { pl: "Czy plan jest konkretny, nie ogólnikowy?", en: "Is the plan concrete, not vague?" },
    hint: { pl: "Czy kroki są szczegółowe i wykonalne?", en: "Are the steps detailed and actionable?" },
  },
  {
    id: "measurable",
    label: { pl: "Czy wskaźniki sukcesu są mierzalne?", en: "Are the success metrics measurable?" },
    hint: { pl: "Czy po wdrożeniu planu będzie można obiektywnie ocenić, czy się udał?", en: "After implementation, can you objectively assess if it worked?" },
  },
];

export default function PeerReviewClient({
  locale,
  tenantSlug,
  action,
  pillarFriendlyName,
  pillarName,
}: PeerReviewClientProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPl = locale === "pl";
  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  const allScored = REVIEW_CRITERIA.every((c) => scores[c.id] !== undefined);
  const totalScore = allScored
    ? Math.round(
        REVIEW_CRITERIA.reduce((sum, c) => sum + (scores[c.id] || 0), 0) /
          REVIEW_CRITERIA.length * 20
      )
    : 0;

  async function handleSubmit() {
    if (!allScored || submitting) return;
    setSubmitting(true);

    // In production: POST to /api/olympiad/review
    console.log("[Peer Review]", {
      tenant_id: tenantSlug,
      checklist_scores: scores,
      total_score: totalScore,
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold mb-3">
          {isPl ? "Ocena wysłana!" : "Review submitted!"}
        </h2>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted max-w-md mx-auto">
          {isPl
            ? "Twoja ocena została zapisana anonimowo. Dziękujemy za wkład w Olimpiadę Certo!"
            : "Your review has been saved anonymously. Thank you for contributing to the Certo Olympiad!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Anonymous notice */}
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 text-center text-sm">
        🔒{" "}
        {isPl
          ? "Ta ocena jest w pełni anonimowa. Nie znasz nazwy organizacji, a ona nie dowie się, kto ją ocenił."
          : "This review is fully anonymous. You don't know the organization's name, and they won't know who reviewed them."}
      </div>

      {/* Pillar info */}
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-center">
        <span className="text-sm">
          {isPl ? "Najsłabszy filar organizacji:" : "Organization's weakest pillar:"}{" "}
          <strong>{pillarFriendlyName}</strong>
          <span className="text-xs text-certo-navy/40 dark:text-certo-dark-muted ml-2">
            ({pillarName})
          </span>
        </span>
      </div>

      {/* Plan to review */}
      <section className="p-6 rounded-xl border border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface">
        <h2 className="font-bold mb-4">
          {isPl ? "Plan poprawy (Certo Action)" : "Improvement plan (Certo Action)"}
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium text-certo-navy/40 dark:text-certo-dark-muted uppercase tracking-wide mb-1">
              {isPl ? "Co chcą zmienić?" : "What do they want to change?"}
            </h3>
            <p className="text-sm">{action.what_to_change}</p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-certo-navy/40 dark:text-certo-dark-muted uppercase tracking-wide mb-1">
              {isPl ? "Kroki" : "Steps"}
            </h3>
            <ol className="text-sm space-y-1 list-decimal pl-4">
              {action.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xs font-medium text-certo-navy/40 dark:text-certo-dark-muted uppercase tracking-wide mb-1">
              {isPl ? "Wskaźniki sukcesu" : "Success metrics"}
            </h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              {action.success_metrics.map((metric, i) => (
                <li key={i}>{metric}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Rating criteria (scale 1-5) */}
      <section>
        <h2 className="font-bold mb-4">
          {isPl ? "Twoja ocena (skala 1–5)" : "Your rating (scale 1–5)"}
        </h2>
        <div className="space-y-6">
          {REVIEW_CRITERIA.map((criterion) => (
            <div key={criterion.id}>
              <div className="mb-2">
                <div className="font-medium text-sm">{t(criterion.label)}</div>
                <div className="text-xs text-certo-navy/40 dark:text-certo-dark-muted">
                  {t(criterion.hint)}
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setScores((prev) => ({ ...prev, [criterion.id]: value }))
                    }
                    className={`
                      w-12 h-12 rounded-xl text-lg font-bold transition-all
                      ${
                        scores[criterion.id] === value
                          ? "bg-certo-gold text-white scale-110 shadow-md"
                          : "bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border hover:border-certo-gold/50 text-certo-navy/60 dark:text-certo-dark-muted"
                      }
                    `}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Score preview */}
      {allScored && (
        <div className="text-center p-4 rounded-xl bg-certo-gold/10 dark:bg-certo-gold/5 border border-certo-gold/20">
          <span className="text-sm">
            {isPl ? "Wynik oceny:" : "Review score:"}{" "}
            <strong className="text-certo-gold text-lg">{totalScore}/100</strong>
          </span>
        </div>
      )}

      {/* Submit */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!allScored || submitting}
          className="px-8 py-4 bg-certo-gold text-white font-bold rounded-xl text-lg hover:bg-certo-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? isPl ? "Wysyłanie..." : "Submitting..."
            : isPl ? "Wyślij ocenę" : "Submit review"}
        </button>
      </div>
    </div>
  );
}
