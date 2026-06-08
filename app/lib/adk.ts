import { getUserFivetranCreds } from "@/lib/fivetran";

const ADK_URL = process.env.ADK_URL ?? "http://localhost:8000";
const APP_NAME = process.env.ADK_APP_NAME ?? "agent";
const AUDIT_APP_NAME = process.env.ADK_AUDIT_APP_NAME ?? "sync_audit";

export async function createAdkSession(userId: string): Promise<string> {
  const { apiKey, apiSecret } = await getUserFivetranCreds(userId);
  const res = await fetch(`${ADK_URL}/apps/${APP_NAME}/users/${userId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: {
        fivetran_api_key: apiKey,
        fivetran_secret_key: apiSecret,
      },
    }),
  });
  if (!res.ok) throw new Error(`ADK create session failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

export function runSSE(
  userId: string,
  sessionId: string,
  message: { role: string; parts: { text?: string; functionResponse?: unknown }[] }
): Promise<Response> {
  return fetch(`${ADK_URL}/run_sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName: APP_NAME,
      userId,
      sessionId,
      newMessage: message,
    }),
  });
}

export async function createAuditSession(userId: string): Promise<string> {
  const { apiKey, apiSecret } = await getUserFivetranCreds(userId);
  const res = await fetch(`${ADK_URL}/apps/${AUDIT_APP_NAME}/users/${userId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: {
        fivetran_api_key: apiKey,
        fivetran_secret_key: apiSecret,
      },
    }),
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

export async function runAudit(
  userId: string,
  sessionId: string,
  message: string,
): Promise<AuditResult> {
  const res = await fetch(`${ADK_URL}/run_sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName: AUDIT_APP_NAME,
      userId,
      sessionId,
      newMessage: { role: "user", parts: [{ text: message }] },
    }),
  });

  if (!res.ok) throw new Error(`ADK audit run failed: ${res.status}`);

  const body = await res.text();
  let agentText = "";
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const event = JSON.parse(line.slice(6));
      const parts = event?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.text) agentText += part.text;
        }
      }
    } catch {
      // skip non-JSON lines
    }
  }

  return extractJson(agentText);
}
