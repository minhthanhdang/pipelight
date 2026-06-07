"use client";

import type { ChatMessage as ChatMessageType, ToolCall } from "@/hooks/useChat";
import ToolConfirmCard from "./ToolConfirmCard";

interface ChatMessageProps {
  message: ChatMessageType;
  isPendingTool: boolean;
  isStreaming: boolean;
  onConfirm: (approved: boolean) => void;
}

export default function ChatMessage({ message, isPendingTool, isStreaming, onConfirm }: ChatMessageProps) {
  if (message.role === "tool_call") {
    let toolCall: ToolCall;
    try {
      toolCall = JSON.parse(message.content);
    } catch {
      return null;
    }

    return (
      <div className="px-4 py-1">
        <ToolConfirmCard
          toolCall={toolCall}
          onConfirm={onConfirm}
          disabled={isStreaming}
        />
      </div>
    );
  }

  if (message.role === "tool_result") return null;

  const isUser = message.role === "user";

  return (
    <div className={`px-4 py-1 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
