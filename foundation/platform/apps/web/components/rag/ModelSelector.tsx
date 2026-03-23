"use client";

type ModelChoice = "sonnet" | "opus";

interface ModelSelectorProps {
  model: ModelChoice;
  onModelChange: (model: ModelChoice) => void;
  thinkingEnabled: boolean;
  onThinkingChange: (enabled: boolean) => void;
}

export function ModelSelector({
  model,
  onModelChange,
  thinkingEnabled,
  onThinkingChange,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Model toggle */}
      <div className="flex items-center rounded-lg border border-gray-200 dark:border-certo-dark-border overflow-hidden text-xs">
        <button
          onClick={() => onModelChange("sonnet")}
          className={`px-3 py-1.5 transition-colors ${
            model === "sonnet"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-certo-dark-surface text-gray-600 dark:text-certo-dark-muted hover:bg-gray-50 dark:hover:bg-certo-dark-card"
          }`}
        >
          Sonnet
        </button>
        <button
          onClick={() => onModelChange("opus")}
          className={`px-3 py-1.5 transition-colors ${
            model === "opus"
              ? "bg-purple-600 text-white"
              : "bg-white dark:bg-certo-dark-surface text-gray-600 dark:text-certo-dark-muted hover:bg-gray-50 dark:hover:bg-certo-dark-card"
          }`}
        >
          Opus
        </button>
      </div>

      {/* Thinking toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 dark:text-certo-dark-muted">
        <div
          className={`relative w-8 h-4.5 rounded-full transition-colors ${
            thinkingEnabled ? "bg-amber-500" : "bg-gray-300"
          }`}
          onClick={() => onThinkingChange(!thinkingEnabled)}
        >
          <div
            className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
              thinkingEnabled ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
        <span className={thinkingEnabled ? "text-amber-700" : "text-gray-400"}>
          Thinking
        </span>
      </label>
    </div>
  );
}
