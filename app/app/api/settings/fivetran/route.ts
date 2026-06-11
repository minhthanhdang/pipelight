import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { FIVETRAN_BASE } from "@/lib/fivetran";
import { syncConnectorsForUser, type ConnectorSyncResult } from "@/lib/connector-sync";

export const GET = withAuth(async (session) => {
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (user?.fivetranApiKey) {
    return Response.json({
      hasKeys: true,
      maskedApiKey: "****" + decrypt(user.fivetranApiKey).slice(-4),
    });
  }

  return Response.json({ hasKeys: false });
});

export const POST = withAuth(async (session, req: Request) => {
  const body = await req.json();
  const { apiKey, apiSecret } = body;

  if (!apiKey || typeof apiKey !== "string" || !apiSecret || typeof apiSecret !== "string") {
    return Response.json({ error: "apiKey and apiSecret are required" }, { status: 400 });
  }

  const res = await fetch(`${FIVETRAN_BASE}/groups`, {
    headers: {
      Authorization: "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
    },
  });

  if (!res.ok) {
    return Response.json({ error: "Invalid Fivetran credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      fivetranApiKey: encrypt(apiKey),
      fivetranApiSecret: encrypt(apiSecret),
    },
  });

  // Auto-load connectors with the freshly saved keys; save succeeds even if this fails
  let connectorSync: ConnectorSyncResult | { error: string };
  try {
    connectorSync = await syncConnectorsForUser(session.user.id);
  } catch (err) {
    console.error("Auto connector sync after key save failed:", err);
    connectorSync = { error: err instanceof Error ? err.message : "Connector sync failed" };
  }

  return Response.json({ success: true, maskedApiKey: "****" + apiKey.slice(-4), connectorSync });
});

export const DELETE = withAuth(async (session) => {
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { fivetranApiKey: null, fivetranApiSecret: null },
  });

  await prisma.connector.deleteMany({ where: { userId } });

  return Response.json({ success: true });
});
