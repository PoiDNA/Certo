"use client";

import { useState } from "react";

export interface Source {
  id: string;
  docTitle: string;
  heading?: string;
  docSourceType: string;
  score: number;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  internal: "Dokument Certo",
  regulation: "Regulacja",
  oecd: "OECD",
  who: "WHO",
  worldbank: "World Bank",
  academic: "Publikacja",
  other: "Inne",
};

export function SourceCard({
  source,
  index,
}: {
  source: Source;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const confidence =
    source.score >= 0.8
      ? "high"
      : source.score >= 0.5
        ? "medium"
        : "low";

  const confidenceColors = {
    high: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-500",
  };

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
    >
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-gray-400 mt-0.5">
          [{index}]
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">
            {source.docTitle}
          </p>
          {source.heading && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {source.heading}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              {SOURCE_TYPE_LABELS[source.docSourceType] || source.docSourceType}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${confidenceColors[confidence]}`}
            >
              {(source.score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
