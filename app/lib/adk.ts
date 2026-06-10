import { getUserFivetranCreds } from "@/lib/fivetran";
import type { AgentConfig } from "@/lib/agent-config";

const ADK_URL = process.env.ADK_URL ?? "http://localhost:8000";
export const APP_NAME = process.env.ADK_APP_NAME ?? "agent";
const AUDIT_APP_NAME = process.env.ADK_AUDIT_APP_NAME ?? "sync_audit";
const SUMMARY_APP_NAME = "sync_summary";

export async function createAdkSession(userId: string, agentConfig?: AgentConfig, appName: string = APP_NAME): Promise<string> {
  const { apiKey, apiSecret } = await getUserFivetranCreds(userId);
  const state: Record<string, unknown> = {
    fivetran_api_key: apiKey,
    fivetran_secret_key: apiSecret,
    "app:userId": userId,
  };
  if (agentConfig) state.agentConfig = agentConfig;

  const res = await fetch(`${ADK_URL}/apps/${appName}/users/${userId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error(`ADK create session failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

export function runSSE(
  userId: string,
  sessionId: string,
  message: { role: string; parts: { text?: string; functionResponse?: unknown }[] },
  agentConfig?: AgentConfig,
  appName: string = APP_NAME,
): Promise<Response> {
  return fetch(`${ADK_URL}/run_sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName,
      userId,
      sessionId,
      newMessage: message,
      ...(agentConfig && { agentConfig }),
    }),
  });
}

const SSE_MAX_RETRIES = 3;
const SSE_RETRY_BASE_MS = 1000;

export async function runSSEWithRetry(
  ...args: Parameters<typeof runSSE>
): Promise<Response> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < SSE_MAX_RETRIES; attempt++) {
    try {
      const res = await runSSE(...args);
      if (res.ok) return res;
      const status = res.status;
      if (status >= 400 && status < 500) {
        const body = await res.text().catch(() => "");
        let msg = `ADK error ${status}`;
        try {
          const parsed = JSON.parse(body);
          if (parsed.errorMessage) msg = parsed.errorMessage;
          else if (parsed.detail) msg = parsed.detail;
        } catch { /* use default msg */ }
        throw new Error(msg);
      }
      const body = await res.text().catch(() => "");
      let msg = `ADK error ${status}`;
      try {
        const parsed = JSON.parse(body);
        if (parsed.errorMessage) msg = parsed.errorMessage;
      } catch { /* use default msg */ }
      lastError = new Error(msg);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.startsWith("ADK error 4")) throw lastError;
    }
    if (attempt < SSE_MAX_RETRIES - 1) {
      const delay = SSE_RETRY_BASE_MS * Math.pow(2, attempt);
      console.warn(`[chat] attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError!.message);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError!;
}

export async function createAuditSession(userId: string, agentConfig?: AgentConfig): Promise<string> {
  const { apiKey, apiSecret } = await getUserFivetranCreds(userId);
  const state: Record<string, unknown> = {
    fivetran_api_key: apiKey,
    fivetran_secret_key: apiSecret,
  };
  if (agentConfig) state.agentConfig = agentConfig;

  const res = await fetch(`${ADK_URL}/apps/${AUDIT_APP_NAME}/users/${userId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error(`ADK create audit session failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

export interface AuditResult {
  judgement: string;
  directCause: string;
  analysis: string;
  suggestions: { action: string; toolName: string; params: Record<string, unknown> }[];
}

function extractJson(text: string): AuditResult {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  return JSON.parse(raw);
}

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 2000;

async function runAuditOnce(
  userId: string,
  sessionId: string,
  message: string,
  agentConfig?: AgentConfig,
): Promise<AuditResult> {
  const res = await fetch(`${ADK_URL}/run_sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName: AUDIT_APP_NAME,
      userId,
      sessionId,
      newMessage: { role: "user", parts: [{ text: message }] },
      ...(agentConfig && { agentConfig }),
    }),
  });

  if (!res.ok) throw new Error(`ADK audit run failed: ${res.status}`);

  const body = await res.text();
  let agentText = "";
  let hasError = false;
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const event = JSON.parse(line.slice(6));
      if (event.errorCode) {
        hasError = true;
        throw new Error(`Agent error ${event.errorCode}: ${event.errorMessage}`);
      }
      const parts = event?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.text) agentText += part.text;
        }
      }
    } catch (e) {
      if (hasError) throw e;
    }
  }

  console.log("[audit] raw SSE body:", body.slice(0, 500));
  console.log("[audit] extracted agentText:", agentText.slice(0, 500));

  if (!agentText.trim()) {
    throw new Error("Agent returned empty response");
  }

  return extractJson(agentText);
}

export async function createSummarySession(userId: string, agentConfig?: AgentConfig): Promise<string> {
  return createAdkSession(userId, agentConfig, SUMMARY_APP_NAME);
}

async function runSummaryOnce(
  userId: string,
  sessionId: string,
  message: string,
  agentConfig?: AgentConfig,
): Promise<string> {
  const res = await fetch(`${ADK_URL}/run_sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName: SUMMARY_APP_NAME,
      userId,
      sessionId,
      newMessage: { role: "user", parts: [{ text: message }] },
      ...(agentConfig && { agentConfig }),
    }),
  });

  if (!res.ok) throw new Error(`ADK summary run failed: ${res.status}`);

  const body = await res.text();
  let agentText = "";
  let hasError = false;
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const event = JSON.parse(line.slice(6));
      if (event.errorCode) {
        hasError = true;
        throw new Error(`Agent error ${event.errorCode}: ${event.errorMessage}`);
      }
      const parts = event?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.text) agentText += part.text;
        }
      }
    } catch (e) {
      if (hasError) throw e;
    }
  }

  if (!agentText.trim()) throw new Error("Summary agent returned empty response");
  return agentText;
}

export async function runSummary(
  userId: string,
  sessionId: string,
  message: string,
  agentConfig?: AgentConfig,
): Promise<string> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await runSummaryOnce(userId, sessionId, message, agentConfig);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt);
        console.warn(`[summary] attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError!;
}

export async function runAudit(
  userId: string,
  sessionId: string,
  message: string,
  agentConfig?: AgentConfig,
): Promise<AuditResult> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await runAuditOnce(userId, sessionId, message, agentConfig);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt);
        console.warn(`[audit] attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError!;
}
