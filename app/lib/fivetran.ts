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
