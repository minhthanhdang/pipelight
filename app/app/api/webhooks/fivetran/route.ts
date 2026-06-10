import { prisma } from "@/lib/prisma";
import { triggerSyncAudit } from "@/lib/audit-trigger";
import { fetchLatestSyncDetails, getUserAuthHeader } from "@/lib/fivetran";
import crypto from "crypto";

export async function POST(req: Request) {
  const secret = process.env.FIVETRAN_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("X-Fivetran-Signature-256");
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  const rawBody = await req.text();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  if (payload.event !== "sync_end") {
    return Response.json({ ok: true, skipped: true });
  }

  const fivetranId = payload.connector_id as string;
  const connector = await prisma.connector.findFirst({
    where: { fivetranId },
  });

  if (!connector) {
    return Response.json({ error: "Connector not found" }, { status: 404 });
  }

  const status = payload.data?.status === "SUCCESSFUL" ? "success" : "failure";
  const errorMessage =
    status === "failure" ? (payload.data?.message ?? "Sync failed") : null;

  const syncEvent = await prisma.syncEvent.create({
    data: {
      connectorId: connector.id,
      fivetranId,
      status,
      startedAt: new Date(payload.data?.started_at ?? new Date()),
      completedAt: new Date(payload.data?.completed_at ?? new Date()),
      rowsSynced: null,
      errorMessage,
      userId: connector.userId,
    },
  });

  const updateData: Record<string, unknown> = {
    syncState: status === "success" ? "synced" : "sync_failed",
  };
  if (status === "success") {
    updateData.succeededAt = new Date();
  } else {
    updateData.failedAt = new Date();
  }

  await prisma.connector.update({
    where: { id: connector.id },
    data: updateData,
  });

  getUserAuthHeader(connector.userId)
    .then((auth) => fetchLatestSyncDetails(fivetranId, auth))
    .then((details) => {
      if (details) {
        return prisma.syncEvent.update({
          where: { id: syncEvent.id },
          data: {
            rowsSynced: details.rowsSynced,
            syncType: details.syncType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            syncMetrics: (details.syncMetrics ?? undefined) as any,
          },
        });
      }
    })
    .catch((err) => console.error("[sync details backfill]", err));

  triggerSyncAudit({
    syncEventId: syncEvent.id,
    connectorId: connector.id,
    fivetranId,
    userId: connector.userId,
    webhookPayload: payload,
  }).catch((err) => console.error("[audit]", err));

  return Response.json({ ok: true });
}
