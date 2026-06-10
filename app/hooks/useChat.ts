"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
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

            if (event.connectCardUri) {
              window.open(event.connectCardUri, "_blank");
              continue;
            }

            if (event.error || event.errorCode) {
              const errMsg = event.error || event.errorMessage || `Agent error ${event.errorCode}`;
              const isModelUnavailable = /503|high demand|unavailable|overloaded/i.test(errMsg);
              const displayMsg = isModelUnavailable ? "Model isn't available right now — please try again later" : errMsg;
              setMessages((prev) => [...prev, { id: nextId(), role: "agent", content: `⚠️ ${displayMsg}` }]);
              toast.error(displayMsg);
              return;
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
                const WRITE_TOOLS = [
                  "modify_connector",
                  "modify_schema_config",
                  "trigger_sync",
                  "resync_connector",
                  "create_connect_card",
                ];
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
        const body: Record<string, unknown> = { message: text, sessionId };
        const res = await fetchWithAuth("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? `Chat API error: ${res.status}`);
        }
        await parseSSEStream(res);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        toast.error(msg);
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
          toolName: toolCall.name,
          approved,
        };

        if (approved && toolCall.name === "create_connect_card") {
          confirmBody.connectorId = toolCall.args.connector_id;
        } else if (approved && toolCall.args) {
          confirmBody.method = toolCall.args.method;
          confirmBody.url = toolCall.args.url;
          confirmBody.body = toolCall.args.body;
        }

        const res = await fetchWithAuth("/api/chat/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(confirmBody),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? `Confirm API error: ${res.status}`);
        }
        await parseSSEStream(res);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        toast.error(msg);
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

  const fetchSessions = useCallback(async (): Promise<ChatSessionSummary[]> => {
    setIsLoadingSessions(true);
    try {
      const res = await fetchWithAuth("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        return data;
      }
      return [];
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
