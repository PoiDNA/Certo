"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  timestamp: Date;
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        role="article"
        aria-label={isUser ? "Wiadomość użytkownika" : "Odpowiedź asystenta"}
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-certo-navy text-white"
            : "bg-gray-50  border border-gray-200  text-gray-800 "
        }`}
      >
        {/* Thinking toggle for assistant messages */}
        {!isUser && message.thinking && (
          <button
            onClick={() => setShowThinking(!showThinking)}
            aria-expanded={showThinking}
            className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-700 mb-2 font-medium"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {showThinking ? "Ukryj" : "Pokaż"} myślenie ({message.thinking.length} zn.)
          </button>
        )}

        {/* Thinking content */}
        {showThinking && message.thinking && (
          <div className="mb-3 p-2 rounded-lg bg-amber-50  border border-amber-100 ">
            <pre className="text-[11px] text-amber-800/80 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
              {message.thinking}
            </pre>
          </div>
        )}

        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : message.content ? (
          <div className="prose prose-sm max-w-none       prose-code:px-1 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <span role="status" aria-label="Ładowanie odpowiedzi">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-certo-gold rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-certo-gold rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-certo-gold rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
