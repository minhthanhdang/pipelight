"use client";

import type { ChatMessage as ChatMessageType, ToolCall } from "@/hooks/useChat";
import { TOOL_CARD_MAP } from "./tool-cards";

interface ChatMessageProps {
  message: ChatMessageType;
  isPendingTool: boolean;
  isStreaming: boolean;
  onConfirm: (approved: boolean) => void;
  connectCardUri?: string | null;
  pendingReauth?: boolean;
  onCompleteReauth?: (completed: boolean) => void;
  reauthError?: string | null;
}

export default function ChatMessage({ message, isPendingTool, isStreaming, onConfirm, connectCardUri, pendingReauth, onCompleteReauth, reauthError }: ChatMessageProps) {
  if (message.role === "tool_call") {
    let toolCall: ToolCall;
    try {
      toolCall = JSON.parse(message.content);
    } catch {
      return null;
    }

    const CardComponent = TOOL_CARD_MAP[toolCall.name];
    if (!CardComponent) return null;

    const baseProps = {
      toolCall,
      onConfirm,
      disabled: isStreaming && !isPendingTool,
    };

    const props = toolCall.name === "open_reauth_dialog"
      ? { ...baseProps, connectCardUri, pendingReauth, onCompleteReauth, reauthError }
      : baseProps;

    return (
      <div className="px-4 py-1">
        <CardComponent {...props} />
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
