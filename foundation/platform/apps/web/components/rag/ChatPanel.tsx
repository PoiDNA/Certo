"use client";

import { useState, useRef, useCallback } from "react";
import { ChatMessage, type Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SourceCard, type Source } from "./SourceCard";

const SECTOR_OPTIONS = [
  { value: "jst", label: "JST (Administracja publiczna)" },
  { value: "corporate", label: "Korporacje" },
  { value: "ngo", label: "NGO" },
  { value: "medical", label: "Sektor medyczny" },
  { value: "defense", label: "Sektor obronny" },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/rag/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            conversationHistory,
            filters: {
              sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6);
            if (!json) continue;

            try {
              const event = JSON.parse(json);

              if (event.type === "sources") {
                setSources(event.sources);
              } else if (event.type === "text") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + event.text }
                      : m
                  )
                );
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Wystapil blad");
        // Remove empty assistant message on error
        setMessages((prev) =>
          prev.filter(
            (m) => !(m.id === assistantId && m.content === "")
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages, selectedSectors]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return (
    <div className="flex h-[calc(100vh-200px)] max-w-6xl mx-auto gap-4">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Certo Methodology Agent
              </h2>
              <p className="text-sm max-w-md mx-auto">
                Zadaj pytanie dotyczace metodologii oceny jakosci zarzadzania,
                norm sektorowych, struktury ratingu lub regulacji.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {error && (
            <div className="mx-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 px-4 py-3">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* Sidebar: filters + sources */}
      <div className="w-72 border-l border-gray-200 overflow-y-auto px-4 py-4 hidden lg:block">
        {/* Sector filters */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Filtr sektorowy
          </h3>
          <div className="space-y-1">
            {SECTOR_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSectors((prev) => [...prev, opt.value]);
                    } else {
                      setSelectedSectors((prev) =>
                        prev.filter((s) => s !== opt.value)
                      );
                    }
                  }}
                  className="rounded border-gray-300"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Zrodla ({sources.length})
            </h3>
            <div className="space-y-2">
              {sources.map((source, i) => (
                <SourceCard key={source.id} source={source} index={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
