"use client";

import { useState, useCallback } from "react";
import EmojiQuestion from "./EmojiQuestion";
import type { SurveyQuestion } from "../../lib/olympiad/types";

interface SurveyFormProps {
  questions: SurveyQuestion[];
  locale: string;
  groupName: string;
  orgName: string;
  onSubmit: (answers: Record<string, number>) => Promise<void>;
  totalRespondents?: number;
}

export default function SurveyForm({
  questions,
  locale,
  groupName,
  orgName,
  onSubmit,
  totalRespondents,
}: SurveyFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = Object.keys(answers).length === questions.length;

  const handleAnswer = useCallback(
    (pillar: string, value: number) => {
      setAnswers((prev) => {
        const questionIndex = questions.findIndex(
          (q) => q.pillar === pillar && !(pillar in prev)
        );
        const key =
          questionIndex >= 0 ? `q${questionIndex}_${pillar}` : pillar;
        return { ...prev, [key]: value };
      });
    },
    [questions]
  );

  // Simpler: track by question index
  const handleAnswerByIndex = useCallback(
    (index: number, _pillar: string, value: number) => {
      setAnswers((prev) => ({ ...prev, [`q${index}`]: value }));
    },
    []
  );

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  async function handleSubmit() {
    if (!isComplete || submitting) return;
    setSubmitting(true);
    try {
      // Convert indexed answers to pillar scores
      const pillarScores: Record<string, number[]> = {};
      questions.forEach((q, i) => {
        const val = answers[`q${i}`];
        if (val !== undefined) {
          if (!pillarScores[q.pillar]) pillarScores[q.pillar] = [];
          pillarScores[q.pillar].push(val);
        }
      });

      // Average per pillar
      const avgScores: Record<string, number> = {};
      for (const [pillar, scores] of Object.entries(pillarScores)) {
        avgScores[pillar] =
          Math.round(
            (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
          ) / 100;
      }

      await onSubmit(avgScores);
      setSubmitted(true);
    } catch {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold mb-3">
          {locale === "pl" ? "Dziękujemy!" : "Thank you!"}
        </h2>
        {totalRespondents !== undefined && (
          <p className="text-lg text-certo-gold font-semibold mb-4">
            {locale === "pl"
              ? `Jesteś ${totalRespondents + 1}. osobą z ${orgName}, która zabrała głos!`
              : `You are the ${totalRespondents + 1}th person from ${orgName} to have your say!`}
          </p>
        )}
        <div className="max-w-md mx-auto p-6 rounded-xl bg-certo-gold/10 dark:bg-certo-gold/5 border border-certo-gold/20">
          <h3 className="font-semibold mb-2">
            {locale === "pl"
              ? "💡 Jak wspierać dobre zarządzanie?"
              : "💡 How to support good governance?"}
          </h3>
          <ul className="text-sm text-left space-y-2 text-certo-navy/70 dark:text-certo-dark-muted">
            <li>
              ✅{" "}
              {locale === "pl"
                ? "Bierz udział w zebraniach i konsultacjach"
                : "Participate in meetings and consultations"}
            </li>
            <li>
              ✅{" "}
              {locale === "pl"
                ? "Pytaj o to, jak podejmowane są decyzje"
                : "Ask about how decisions are made"}
            </li>
            <li>
              ✅{" "}
              {locale === "pl"
                ? "Zgłaszaj pomysły i problemy"
                : "Report ideas and problems"}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2 text-certo-navy/60 dark:text-certo-dark-muted">
          <span>
            {locale === "pl"
              ? `Odpowiedzi: ${answeredCount}/${questions.length}`
              : `Answers: ${answeredCount}/${questions.length}`}
          </span>
          <span className="text-certo-gold font-semibold">{groupName}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-certo-dark-border rounded-full overflow-hidden">
          <div
            className="h-full bg-certo-gold rounded-full transition-all duration-300"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div>
        {questions.map((q, index) => {
          const text =
            q.text[locale as keyof typeof q.text] ||
            q.text.en ||
            q.text.pl ||
            Object.values(q.text)[0] ||
            "";
          return (
            <EmojiQuestion
              key={index}
              questionText={text}
              pillar={q.pillar}
              audioUrl={q.audioUrl}
              onAnswer={(_pillar, value) =>
                handleAnswerByIndex(index, _pillar, value)
              }
            />
          );
        })}
      </div>

      {/* Submit */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          className={`
            px-8 py-4 rounded-xl text-lg font-bold transition-all
            ${
              isComplete
                ? "bg-certo-gold text-white hover:bg-certo-gold-light cursor-pointer"
                : "bg-gray-300 dark:bg-certo-dark-border text-gray-500 dark:text-certo-dark-muted cursor-not-allowed"
            }
          `}
        >
          {submitting
            ? locale === "pl"
              ? "Wysyłanie..."
              : "Submitting..."
            : locale === "pl"
              ? "Wyślij odpowiedzi"
              : "Submit answers"}
        </button>
      </div>
    </div>
  );
}
