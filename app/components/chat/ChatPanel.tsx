"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAIStore } from "@/stores/useAIStore";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import ChatSessionList from "./ChatSessionList";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatPanel({ open, onClose }: ChatPanelProps) {
  const {
    messages,
    sessionId,
    isStreaming,
    pendingToolCall,
    sessions,
    sendMessage,
    confirmTool,
    fetchSessions,
    switchSession,
    startNewSession,
  } = useChat();

  const [showHistory, setShowHistory] = useState(false);
  const pendingPrompt = useAIStore((s) => s.pendingPrompt);
  const setPendingPrompt = useAIStore((s) => s.setPendingPrompt);
  const handledPromptRef = useRef<string | null>(null);

  const prevOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;
    if (!open) return;
    fetchSessions().then((list) => {
      if (justOpened && list.length > 0 && !pendingPrompt) {
        switchSession(list[0].id);
      }
    });
  }, [open, fetchSessions, switchSession, pendingPrompt]);

  useEffect(() => {
    if (open && pendingPrompt && handledPromptRef.current !== pendingPrompt) {
      handledPromptRef.current = pendingPrompt;
      startNewSession();
      sendMessage(pendingPrompt);
      setPendingPrompt(null);
      setShowHistory(false);
    }
  }, [open, pendingPrompt, startNewSession, sendMessage, setPendingPrompt]);

  const handleSelectSession = async (sid: string) => {
    await switchSession(sid);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    startNewSession();
    setShowHistory(false);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-background shadow-xl border-l border-border z-50 flex flex-col transition-transform duration-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <ChatHeader
        onClose={onClose}
        onToggleHistory={() => setShowHistory((v) => !v)}
        onNewChat={handleNewChat}
        showingHistory={showHistory}
      />
      {showHistory ? (
        <ChatSessionList
          sessions={sessions}
          activeSessionId={sessionId}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
        />
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            pendingToolCall={pendingToolCall}
            isStreaming={isStreaming}
            onConfirm={confirmTool}
          />
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </>
      )}

    </div>
  );
}
