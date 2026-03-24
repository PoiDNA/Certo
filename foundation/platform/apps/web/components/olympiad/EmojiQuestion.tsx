"use client";

import { useState } from "react";

interface EmojiQuestionProps {
  questionText: string;
  pillar: string;
  audioUrl?: string;
  onAnswer: (pillar: string, value: number) => void;
}

const EMOJI_OPTIONS = [
  { emoji: "👎", label: "Nie", value: -1, color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700" },
  { emoji: "🤷", label: "Nie wiem", value: 0, color: "bg-gray-100 dark:bg-gray-800/30 border-gray-300 dark:border-gray-600" },
  { emoji: "👍", label: "Tak", value: 2, color: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" },
] as const;

export default function EmojiQuestion({
  questionText,
  pillar,
  audioUrl,
  onAnswer,
}: EmojiQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleSelect(value: number) {
    setSelected(value);
    onAnswer(pillar, value);
  }

  function handleAudio() {
    if (!audioUrl || isPlaying) return;
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }

  return (
    <div className="py-6 border-b border-certo-navy/10 dark:border-certo-dark-border last:border-b-0">
      <div className="flex items-start gap-3 mb-4">
        <p className="text-base md:text-lg font-medium flex-1">
          {questionText}
        </p>
        {audioUrl && (
          <button
            onClick={handleAudio}
            disabled={isPlaying}
            className="shrink-0 w-10 h-10 rounded-full bg-certo-gold/20 hover:bg-certo-gold/30 flex items-center justify-center text-lg transition-colors disabled:opacity-50"
            aria-label="Czytaj na głos"
          >
            {isPlaying ? "⏳" : "🔊"}
          </button>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {EMOJI_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`
              flex flex-col items-center gap-1 px-6 py-4 rounded-xl border-2 transition-all
              ${
                selected === option.value
                  ? `${option.color} border-certo-gold scale-105 shadow-md`
                  : "border-transparent bg-white dark:bg-certo-dark-surface hover:border-certo-navy/20 dark:hover:border-certo-dark-border"
              }
            `}
          >
            <span className="text-4xl">{option.emoji}</span>
            <span className="text-xs font-medium text-certo-navy/60 dark:text-certo-dark-muted">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
