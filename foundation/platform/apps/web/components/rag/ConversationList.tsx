"use client";

export interface Conversation {
  id: string;
  title: string;
  model: string;
  thinking_enabled: boolean;
  message_count: number;
  summary?: string;
  shared?: boolean;
  tags?: string[];
  updated_at: string;
  created_at: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "teraz";
  if (diffMin < 60) return `${diffMin} min temu`;
  if (diffHour < 24) return `${diffHour}h temu`;
  if (diffDay < 7) return `${diffDay}d temu`;
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-certo-dark-border text-sm text-gray-700 dark:text-certo-dark-text hover:bg-white dark:hover:bg-certo-dark-card hover:border-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nowa rozmowa
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-certo-dark-muted text-center mt-8 px-4">
            Brak zapisanych rozmów
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  activeId === conv.id
                    ? "bg-white dark:bg-certo-dark-card shadow-sm border border-gray-200 dark:border-certo-dark-border"
                    : "hover:bg-gray-100 dark:hover:bg-certo-dark-card"
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex items-center gap-1 pr-6">
                  <p className="text-sm text-gray-800 dark:text-certo-dark-text truncate font-medium flex-1">
                    {conv.title || "Nowa rozmowa"}
                  </p>
                  {conv.shared && (
                    <span className="text-[10px] text-green-600" title="Udostępniona">👥</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span
                    className={`text-[10px] px-1 py-0.5 rounded ${
                      conv.model === "opus"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {conv.model === "opus" ? "Opus" : "Sonnet"}
                  </span>
                  {conv.message_count > 0 && (
                    <span className="text-[10px] text-gray-400">
                      {conv.message_count} wiad.
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {formatDate(conv.updated_at)}
                  </span>
                </div>
                {/* Tags */}
                {conv.tags && conv.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {conv.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1 py-0.5 rounded bg-amber-50 text-amber-700"
                      >
                        #{tag}
                      </span>
                    ))}
                    {conv.tags.length > 3 && (
                      <span className="text-[9px] text-gray-400">+{conv.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                  title="Usuń rozmowę"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
