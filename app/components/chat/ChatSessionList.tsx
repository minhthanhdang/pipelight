"use client";

import { Plus } from "lucide-react";
import { useAIStore } from "@/stores/useAIStore";

type SessionItem = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
};

interface ChatSessionListProps {
  sessions: SessionItem[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ChatSessionList({
  sessions,
  activeSessionId,
  onSelect,
  onNewChat,
}: ChatSessionListProps) {
  const isStreaming = useAIStore((s) => s.isStreaming);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-3">
        <button
          onClick={onNewChat}
          disabled={isStreaming}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isStreaming ? "opacity-50 pointer-events-none" : "text-primary bg-accent hover:bg-accent/80"}`}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No conversations yet
          </p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            disabled={isStreaming}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
              isStreaming
                ? "opacity-50 pointer-events-none"
                : s.id === activeSessionId
                  ? "bg-accent border border-border"
                  : "hover:bg-accent"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground truncate flex-1">
                {s.title}
              </span>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                {relativeTime(s.updatedAt)}
              </span>
            </div>
            {s.preview && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {s.preview}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
