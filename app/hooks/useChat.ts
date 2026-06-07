"use client";

import { useState, useCallback, useRef } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAIStore } from "@/stores/useAIStore";

export type ChatMessage = {
  id: string;
  role: "user" | "agent" | "tool_call" | "tool_result";
  content: string;
  createdAt?: string;
};

export type ToolCall = {
  name: string;
  id: string;
  args: Record<string, unknown>;
};

export type ChatSessionSummary = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const isStreaming = useAIStore((s) => s.isStreaming);
  const setIsStreaming = useAIStore((s) => s.setIsStreaming);
  const [pendingToolCall, setPendingToolCall] = useState<ToolCall | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const msgIdCounter = useRef(0);

  const nextId = () => `local-${++msgIdCounter.current}`;

  const parseSSEStream = useCallback(
    async (response: Response) => {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";
      let agentMsgId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";

        for (const line of parts) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const event = JSON.parse(raw);
            console.log("SSE event:", JSON.stringify(event).slice(0, 300));

            if (event.sessionId && !sessionId) {
              setSessionId(event.sessionId);
              continue;
            }

            const eventParts = event?.content?.parts;
            if (!eventParts) continue;

            for (const part of eventParts) {
              if (part.text) {
                if (!agentMsgId) {
                  agentMsgId = nextId();
                  setMessages((prev) => [
                    ...prev,
                    { id: agentMsgId!, role: "agent", content: part.text },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === agentMsgId
                        ? { ...m, content: m.content + part.text }
                        : m
                    )
                  );
                }
              }

              if (part.functionCall) {
                const name = part.functionCall.name;
                const WRITE_TOOLS = ["modify_connector", "modify_schema_config", "trigger_sync", "resync_connector"];
                if (WRITE_TOOLS.includes(name)) {
                  const tc: ToolCall = {
                    name,
                    id: part.functionCall.id ?? name,
                    args: part.functionCall.args ?? {},
                  };
                  const toolMsg: ChatMessage = {
                    id: nextId(),
                    role: "tool_call",
                    content: JSON.stringify(tc),
                  };
                  setMessages((prev) => [...prev, toolMsg]);
                  setPendingToolCall(tc);
                }
              }
            }
          } catch {
            // non-JSON
          }
        }
      }
    },
    [sessionId]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { id: nextId(), role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      try {
        const res = await fetchWithAuth("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, sessionId }),
        });

        if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
        await parseSSEStream(res);
      } finally {
        setIsStreaming(false);
        fetchSessions();
      }
    },
    [sessionId, parseSSEStream]
  );

  const confirmTool = useCallback(
    async (approved: boolean) => {
      if (!pendingToolCall || !sessionId) return;

      const toolCall = pendingToolCall;
      setPendingToolCall(null);
      setIsStreaming(true);

      try {
        const confirmBody: Record<string, unknown> = {
          sessionId,
          toolCallId: toolCall.id,
          approved,
        };

        if (approved && toolCall.args) {
          confirmBody.method = toolCall.args.method;
          confirmBody.url = toolCall.args.url;
          confirmBody.body = toolCall.args.body;
        }

        const res = await fetchWithAuth("/api/chat/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(confirmBody),
        });

        if (!res.ok) throw new Error(`Confirm API error: ${res.status}`);
        await parseSSEStream(res);
      } finally {
        setIsStreaming(false);
      }
    },
    [pendingToolCall, sessionId, parseSSEStream]
  );

  const loadHistory = useCallback(async (sid: string) => {
    const res = await fetchWithAuth(`/api/chat/history?sessionId=${sid}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data);
    setSessionId(sid);
  }, []);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetchWithAuth("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const switchSession = useCallback(
    async (sid: string) => {
      await loadHistory(sid);
    },
    [loadHistory]
  );

  const startNewSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setPendingToolCall(null);
  }, []);

  return {
    messages,
    sessionId,
    isStreaming,
    pendingToolCall,
    sessions,
    isLoadingSessions,
    sendMessage,
    confirmTool,
    loadHistory,
    fetchSessions,
    switchSession,
    startNewSession,
  };
}
