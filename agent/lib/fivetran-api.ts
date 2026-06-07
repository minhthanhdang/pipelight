export const FIVETRAN_BASE = "https://api.fivetran.com/v1";
export const GROUP_ID = "glade_several";

export interface FivetranCreds {
  apiKey: string;
  secretKey: string;
}

function buildAuthHeader(creds?: FivetranCreds): string {
  if (creds) {
    return "Basic " + Buffer.from(`${creds.apiKey}:${creds.secretKey}`).toString("base64");
  }
  const envKey = process.env.FIVETRAN_API_KEY_BASE64;
  if (!envKey) throw new Error("No Fivetran credentials available");
  return `Basic ${envKey}`;
}

export async function fivetranFetch(
  path: string,
  options: RequestInit = {},
  creds?: FivetranCreds,
): Promise<unknown> {
  const res = await fetch(`${FIVETRAN_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: buildAuthHeader(creds),
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Fivetran API ${res.status}: ${body}`);
  }

  const json = JSON.parse(body);
  return json.data;
}
