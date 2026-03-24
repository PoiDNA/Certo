"use client";

import { useState, useEffect } from "react";

interface Question {
  id: number;
  text: Record<string, string>;
  options: { id: string; text: Record<string, string> }[];
  correct: string;
}

interface TeamTestClientProps {
  locale: string;
  tenantSlug: string;
  questions: Question[];
  durationMin: number;
  passingPct: number;
  teamAlias: string;
}

export default function TeamTestClient({
  locale,
  tenantSlug,
  questions,
  durationMin,
  passingPct,
  teamAlias,
}: TeamTestClientProps) {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);
  const [submitted, setSubmitted] = useState(false);

  const isPl = locale === "pl";
  const t = (key: Record<string, string>) =>
    key[locale] || key.en || key.pl || Object.values(key)[0] || "";

  // Timer
  useEffect(() => {
    if (!started || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function selectAnswer(questionId: number, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function calculateScore() {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct) correct++;
    }
    return Math.round((correct / questions.length) * 100);
  }

  // Pre-test screen
  if (!started) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">
          {isPl ? "Test wiedzy" : "Knowledge test"}
        </h1>
        <p className="text-certo-navy/60 dark:text-certo-dark-muted mb-8 max-w-md mx-auto">
          {isPl
            ? `${teamAlias} wspólnie rozwiązuje ${questions.length} pytań. Macie ${durationMin} minut. Dyskutujcie nad każdym pytaniem!`
            : `The ${teamAlias} solves ${questions.length} questions together. You have ${durationMin} minutes. Discuss each question!`}
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8 text-center">
          <div className="p-3 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border">
            <div className="text-2xl font-bold text-certo-gold">{questions.length}</div>
            <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
              {isPl ? "pytań" : "questions"}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border">
            <div className="text-2xl font-bold text-certo-gold">{durationMin}</div>
            <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
              {isPl ? "minut" : "minutes"}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border">
            <div className="text-2xl font-bold text-certo-gold">{passingPct}%</div>
            <div className="text-xs text-certo-navy/50 dark:text-certo-dark-muted">
              {isPl ? "próg" : "threshold"}
            </div>
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="px-8 py-4 bg-certo-gold text-white font-bold rounded-xl text-lg hover:bg-certo-gold-light transition-colors"
        >
          {isPl ? "Rozpocznij test" : "Start test"}
        </button>
      </div>
    );
  }

  // Results screen
  if (submitted) {
    const score = calculateScore();
    const passed = score >= passingPct;
    const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">{passed ? "🎉" : "📚"}</div>
        <h2 className="text-3xl font-bold mb-2">
          {passed
            ? isPl ? "Gratulacje!" : "Congratulations!"
            : isPl ? "Spróbujcie ponownie" : "Try again"}
        </h2>

        <div className="my-8 p-6 rounded-2xl bg-white dark:bg-certo-dark-surface border border-certo-navy/10 dark:border-certo-dark-border inline-block">
          <div className={`text-5xl font-bold ${passed ? "text-green-500" : "text-red-400"}`}>
            {score}%
          </div>
          <div className="text-sm text-certo-navy/50 dark:text-certo-dark-muted mt-1">
            {correctCount}/{questions.length} {isPl ? "poprawnych" : "correct"}
          </div>
        </div>

        <p className="text-certo-navy/60 dark:text-certo-dark-muted max-w-md mx-auto mb-8">
          {passed
            ? isPl
              ? "Faza II zaliczona! Możecie przejść do Fazy III — Certo Action."
              : "Phase II passed! You can proceed to Phase III — Certo Action."
            : isPl
              ? `Próg zaliczenia to ${passingPct}%. Przejrzyjcie materiały i spróbujcie ponownie.`
              : `The passing threshold is ${passingPct}%. Review the materials and try again.`}
        </p>

        {/* Show correct answers */}
        <div className="text-left max-w-2xl mx-auto space-y-4">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? "border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10"
                    : "border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10"
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {i + 1}. {t(q.text)} {isCorrect ? "✅" : "❌"}
                </div>
                {!isCorrect && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {isPl ? "Poprawna odpowiedź" : "Correct answer"}:{" "}
                    {t(q.options.find((o) => o.id === q.correct)?.text || { pl: "" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Test in progress
  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {/* Header with timer */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
          {currentQ + 1} / {questions.length}
        </div>
        <div
          className={`text-lg font-mono font-bold ${
            timeLeft < 120 ? "text-red-500 animate-pulse" : "text-certo-gold"
          }`}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-certo-navy/60 dark:text-certo-dark-muted">
          {answeredCount}/{questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-gray-200 dark:bg-certo-dark-border rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-certo-gold rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">{t(question.text)}</h2>
        <div className="space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => selectAnswer(question.id, opt.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[question.id] === opt.id
                  ? "border-certo-gold bg-certo-gold/10 dark:bg-certo-gold/5"
                  : "border-certo-navy/10 dark:border-certo-dark-border bg-white dark:bg-certo-dark-surface hover:border-certo-navy/20"
              }`}
            >
              <span className="font-semibold text-certo-gold mr-2">
                {opt.id.toUpperCase()}.
              </span>
              {t(opt.text)}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm rounded-lg border border-certo-navy/20 dark:border-certo-dark-border disabled:opacity-30"
        >
          {isPl ? "← Poprzednie" : "← Previous"}
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ((p) => p + 1)}
            className="px-4 py-2 text-sm rounded-lg bg-certo-gold text-white font-medium"
          >
            {isPl ? "Następne →" : "Next →"}
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            disabled={answeredCount < questions.length}
            className="px-6 py-2 text-sm rounded-lg bg-certo-gold text-white font-bold disabled:opacity-50"
          >
            {isPl ? "Zakończ test" : "Finish test"}
          </button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex justify-center gap-2 mt-8">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentQ(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentQ
                ? "bg-certo-gold"
                : answers[q.id]
                  ? "bg-certo-gold/40"
                  : "bg-gray-300 dark:bg-certo-dark-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
