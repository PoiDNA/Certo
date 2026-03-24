"use client";

import { useState, useRef, useCallback } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (text.trim() && !isStreaming) {
      onSend(text.trim());
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [text, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, []);

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Zadaj pytanie o metodologie Certo..."
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-certo-gold/50 focus:border-certo-gold placeholder:text-certo-fg-muted"
        disabled={isStreaming}
      />

      {isStreaming ? (
        <button
          onClick={onStop}
          className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-4 py-2.5 rounded-xl bg-certo-navy text-white text-sm font-medium hover:bg-certo-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Wyslij
        </button>
      )}
    </div>
  );
}
