"use client";

import { X, Bot, Plus, History } from "lucide-react";
import { useAIStore } from "@/stores/useAIStore";

interface ChatHeaderProps {
  onClose: () => void;
  onToggleHistory: () => void;
  onNewChat: () => void;
  showingHistory: boolean;
}

export default function ChatHeader({
  onClose,
  onToggleHistory,
  onNewChat,
  showingHistory,
}: ChatHeaderProps) {
  const isStreaming = useAIStore((s) => s.isStreaming);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">AI Agent</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onNewChat}
          disabled={isStreaming}
          className={`p-1.5 rounded-md ${isStreaming ? "opacity-50 pointer-events-none" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          title="New chat"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleHistory}
          disabled={isStreaming}
          className={`p-1.5 rounded-md ${
            isStreaming
              ? "opacity-50 pointer-events-none"
              : showingHistory
                ? "text-primary bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          title="Chat history"
        >
          <History className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
