import type { Context } from "@google/adk";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const AGENT_API_KEY = process.env.AGENT_API_KEY ?? "";

export async function appFetch(
  path: string,
  params: Record<string, string | undefined>,
  context?: Context,
): Promise<unknown> {
  const userId = context?.state.get("app:userId") as string | undefined;
  if (!userId) throw new Error("userId not found in agent context state");

  const url = new URL(path, APP_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-agent-api-key": AGENT_API_KEY,
      "x-user-id": userId,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`App API ${res.status}: ${body}`);
  }

  return res.json();
}
