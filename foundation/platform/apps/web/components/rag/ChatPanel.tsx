"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage, type Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SourceCard, type Source } from "./SourceCard";
import { ConversationList, type Conversation } from "./ConversationList";
import { ModelSelector } from "./ModelSelector";

type ModelChoice = "sonnet" | "opus";

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
  const [expandedQueries, setExpandedQueries] = useState<string[]>([]);
  const [wasSummarized, setWasSummarized] = useState(false);
  const [graphConcepts, setGraphConcepts] = useState<Array<{ name: string; type: string; sectors: string[]; similarity: number }>>([]);
  const [appliedRules, setAppliedRules] = useState<Array<{ name: string; type: string; sectors: string[]; regulation?: string }>>([]);
  const [ruleConflicts, setRuleConflicts] = useState<string[]>([]);
  const [model, setModel] = useState<ModelChoice>("sonnet");
  const [thinkingEnabled, setThinkingEnabled] = useState(true);
  const [currentThinking, setCurrentThinking] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  // Conversation persistence
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/rag/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch { /* ignore */ }
  };

  const createConversation = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/rag/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, thinking_enabled: thinkingEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations((prev) => [data, ...prev]);
        return data.id;
      }
    } catch { /* ignore */ }
    return null;
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/rag/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConversationId(id);
        setModel(data.model || "sonnet");
        setThinkingEnabled(data.thinking_enabled !== false);
        setMessages(
          (data.messages || []).map((m: { id: string; role: string; content: string; thinking?: string; created_at: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            thinking: m.thinking || undefined,
            timestamp: new Date(m.created_at),
          }))
        );
        setSources([]);
        setError(null);
      }
    } catch { /* ignore */ }
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/rag/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
        setSources([]);
      }
    } catch { /* ignore */ }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSources([]);
    setError(null);
    setCurrentThinking("");
  };

  const saveMessages = async (
    convId: string,
    userMsg: string,
    assistantMsg: string,
    thinking: string,
    sourcesData: Source[]
  ) => {
    try {
      await fetch(`/api/rag/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userMsg,
          assistantMessage: assistantMsg,
          thinking: thinking || undefined,
          sources: sourcesData,
          model,
        }),
      });
      fetchConversations(); // refresh list for updated titles
    } catch { /* ignore */ }
  };

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      setCurrentThinking("");

      // Ensure we have a conversation
      let convId = activeConversationId;
      if (!convId) {
        convId = await createConversation();
        if (convId) setActiveConversationId(convId);
      }

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

      let fullAssistantText = "";
      let fullThinking = "";

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
            model,
            thinking: thinkingEnabled,
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
        let currentSources: Source[] = [];

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
                currentSources = event.sources;
                setSources(event.sources);
                if (event.expandedQueries) setExpandedQueries(event.expandedQueries);
                if (event.summarized) setWasSummarized(true);
                if (event.concepts) setGraphConcepts(event.concepts);
                if (event.rules) setAppliedRules(event.rules);
                if (event.conflicts) setRuleConflicts(event.conflicts);
              } else if (event.type === "thinking") {
                fullThinking += event.text;
                setCurrentThinking((prev) => prev + event.text);
              } else if (event.type === "text") {
                fullAssistantText += event.text;
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

        // Store thinking in the message
        if (fullThinking) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, thinking: fullThinking } : m
            )
          );
        }

        // Persist to Supabase
        if (convId) {
          saveMessages(convId, text, fullAssistantText, fullThinking, currentSources);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Wystąpił błąd");
        setMessages((prev) =>
          prev.filter(
            (m) => !(m.id === assistantId && m.content === "")
          )
        );
      } finally {
        setIsStreaming(false);
        setCurrentThinking("");
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStreaming, messages, selectedSectors, model, thinkingEnabled, activeConversationId]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Conversation sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-200 overflow-hidden border-r border-gray-200 bg-gray-50 flex-shrink-0`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={loadConversation}
          onDelete={deleteConversation}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: model selector + sidebar toggle */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title={sidebarOpen ? "Ukryj historię" : "Pokaż historię"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <ModelSelector
            model={model}
            onModelChange={setModel}
            thinkingEnabled={thinkingEnabled}
            onThinkingChange={setThinkingEnabled}
          />

          <div className="flex-1" />

          {/* Export DOCX button */}
          {messages.length > 0 && (
            <button
              onClick={async () => {
                const payload = activeConversationId
                  ? { conversationId: activeConversationId }
                  : { messages: messages.map((m) => ({ role: m.role, content: m.content, thinking: m.thinking })) };
                const res = await fetch("/api/rag/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `certo-analiza-${Date.now()}.docx`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              title="Eksportuj do DOCX"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOCX
            </button>
          )}

          {activeConversationId && (
            <span className="text-xs text-gray-400 font-mono">
              {activeConversationId.slice(0, 8)}
            </span>
          )}
        </div>

        {/* Thinking indicator */}
        {currentThinking && isStreaming && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <details open className="text-xs">
              <summary className="cursor-pointer text-amber-700 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Myślenie głębokie... ({currentThinking.length} znaków)
              </summary>
              <pre className="mt-1 text-[11px] text-amber-800/70 whitespace-pre-wrap max-h-32 overflow-y-auto font-mono leading-relaxed">
                {currentThinking.slice(-1000)}
              </pre>
            </details>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Certo Methodology Agent
              </h2>
              <p className="text-sm max-w-md mx-auto mb-4">
                Zadaj pytanie dotyczące metodologii oceny jakości zarządzania,
                norm sektorowych, struktury ratingu lub regulacji.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className={`px-2 py-0.5 rounded-full ${model === "opus" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {model === "opus" ? "Claude Opus" : "Claude Sonnet"}
                </span>
                {thinkingEnabled && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Extended Thinking
                  </span>
                )}
              </div>
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

      {/* Right sidebar: filters + sources */}
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

        {/* Query expansion info */}
        {expandedQueries.length > 1 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Warianty zapytania ({expandedQueries.length})
            </h3>
            <div className="space-y-1">
              {expandedQueries.map((q, i) => (
                <p key={i} className={`text-[11px] leading-tight ${i === 0 ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                  {i === 0 ? "🔍 " : "↳ "}{q}
                </p>
              ))}
            </div>
            {wasSummarized && (
              <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                <span>📝</span> Historia skompresowana
              </p>
            )}
          </div>
        )}

        {/* Knowledge Graph Concepts */}
        {graphConcepts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              🔗 Koncepty ({graphConcepts.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {graphConcepts.map((c, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    c.type === "regulation" ? "bg-blue-50 text-blue-700" :
                    c.type === "requirement" ? "bg-red-50 text-red-700" :
                    c.type === "process" ? "bg-green-50 text-green-700" :
                    c.type === "role" ? "bg-purple-50 text-purple-700" :
                    c.type === "risk_category" ? "bg-orange-50 text-orange-700" :
                    "bg-gray-100 text-gray-600"
                  }`}
                  title={`${c.type} | sektory: ${c.sectors.join(",")} | similarity: ${c.similarity.toFixed(2)}`}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Applied Rules */}
        {appliedRules.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              📋 Reguły ({appliedRules.length})
            </h3>
            <div className="space-y-1.5">
              {appliedRules.slice(0, 6).map((r, i) => (
                <div key={i} className="text-[11px] p-1.5 rounded bg-gray-50 border border-gray-100">
                  <p className="font-medium text-gray-700">{r.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[9px] px-1 py-0.5 rounded ${
                      r.type === "requirement" ? "bg-blue-50 text-blue-600" :
                      r.type === "prohibition" ? "bg-red-50 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {r.type}
                    </span>
                    {r.regulation && (
                      <span className="text-[9px] text-amber-600">{r.regulation}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rule Conflicts */}
        {ruleConflicts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
              ⚠️ Konflikty ({ruleConflicts.length})
            </h3>
            <div className="space-y-1">
              {ruleConflicts.map((c, i) => (
                <p key={i} className="text-[10px] text-red-600 leading-tight p-1.5 rounded bg-red-50 border border-red-100">
                  {c}
                </p>
              ))}
            </div>
          </div>
        )}


        {/* Sources */}
        {sources.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Źródła ({sources.length})
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
