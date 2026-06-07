"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType, ToolCall } from "@/hooks/useChat";
import { Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  pendingToolCall: ToolCall | null;
  isStreaming: boolean;
  onConfirm: (approved: boolean) => void;
}

export default function ChatMessageList({
  messages,
  pendingToolCall,
  isStreaming,
  onConfirm,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto py-3 space-y-1">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Send a message to get started
        </div>
      )}
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          isPendingTool={
            msg.role === "tool_call" &&
            pendingToolCall !== null &&
            (() => {
              try {
                return JSON.parse(msg.content).id === pendingToolCall.id;
              } catch {
                return false;
              }
            })()
          }
          isStreaming={isStreaming}
          onConfirm={onConfirm}
        />
      ))}
      {isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
        <div className="flex items-start gap-2.5 px-4 py-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
