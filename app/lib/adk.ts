import { getUserFivetranCreds } from "@/lib/fivetran";

const ADK_URL = process.env.ADK_URL ?? "http://localhost:8000";
const APP_NAME = process.env.ADK_APP_NAME ?? "agent";

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
