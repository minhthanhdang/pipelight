import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export const FIVETRAN_BASE = "https://api.fivetran.com/v1";

export function getAuthHeader(apiKey: string, apiSecret: string) {
  return "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
}

export async function getUserFivetranCreds(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { fivetranApiKey: true, fivetranApiSecret: true } });
  if (!user.fivetranApiKey || !user.fivetranApiSecret) {
    throw new Error("Fivetran API keys not configured");
  }
  return {
    apiKey: decrypt(user.fivetranApiKey),
    apiSecret: decrypt(user.fivetranApiSecret),
  };
}

export async function getUserAuthHeader(userId: string) {
  const { apiKey, apiSecret } = await getUserFivetranCreds(userId);
  return getAuthHeader(apiKey, apiSecret);
}

export async function fetchAllGroups(authHeader: string): Promise<{ id: string; name: string; service: string }[]> {
  const res = await fetch(`${FIVETRAN_BASE}/groups`, {
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error(`Fivetran groups API error: ${res.status}`);
  const json = await res.json();
  return json.data?.items ?? [];
}

export async function fetchConnectorsInGroup(groupId: string, authHeader: string) {
  const res = await fetch(`${FIVETRAN_BASE}/groups/${groupId}/connectors`, {
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error(`Fivetran group connectors API error: ${res.status}`);
  const json = await res.json();
  return json.data?.items ?? [];
}

export async function fetchGroupFromFivetran(groupId: string, authHeader: string) {
  const res = await fetch(`${FIVETRAN_BASE}/groups/${groupId}`, {
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error(`Fivetran group API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchConnectorFromFivetran(id: string, authHeader: string) {
  const [connRes, schemaRes] = await Promise.all([
    fetch(`${FIVETRAN_BASE}/connectors/${id}`, {
      headers: { Authorization: authHeader },
    }),
    fetch(`${FIVETRAN_BASE}/connectors/${id}/schemas`, {
      headers: { Authorization: authHeader },
    }),
  ]);

  if (!connRes.ok) {
    throw new Error(`Fivetran API error: ${connRes.status}`);
  }

  const connJson = await connRes.json();
  const data = connJson.data;

  if (schemaRes.ok) {
    const schemaJson = await schemaRes.json();
    data.schema_change_handling = schemaJson.data?.schema_change_handling ?? "ALLOW_ALL";
  } else {
    data.schema_change_handling = "ALLOW_ALL";
  }

  return data;
}

export async function fetchLatestSyncDetails(connectorId: string, authHeader: string): Promise<{
  rowsSynced: number | null;
  syncType: string | null;
  syncMetrics: Record<string, unknown> | null;
} | null> {
  const res = await fetch(
    `${FIVETRAN_BASE}/connectors/${connectorId}/sync-history?limit=1`,
    { headers: { Authorization: authHeader } },
  );
  if (!res.ok) return null;
  const json = await res.json();
  const entry = json.data?.items?.[0];
  if (!entry) return null;

  const extractVolume = entry.stages?.extract?.volume;
  const rowsSynced = typeof extractVolume === "number" ? Math.round(extractVolume) : null;

  const syncType = entry.is_historical_sync ? "historical" : "incremental";

  return { rowsSynced, syncType, syncMetrics: entry };
}

/** @deprecated Use fetchLatestSyncDetails */
export async function fetchLatestSyncRowCount(connectorId: string, authHeader: string): Promise<number | null> {
  const details = await fetchLatestSyncDetails(connectorId, authHeader);
  return details?.rowsSynced ?? null;
}
