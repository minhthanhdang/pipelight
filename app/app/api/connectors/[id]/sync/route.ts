import { type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import {
  fetchConnectorFromFivetran,
  fetchGroupFromFivetran,
  fetchLatestSyncDetails,
  getUserAuthHeader,
} from "@/lib/fivetran";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (
  session,
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = session.user.id;
  const { id } = await params;

  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(userId);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  const c = await fetchConnectorFromFivetran(id, authHeader);

  const succeededAt = c.succeeded_at ? new Date(c.succeeded_at) : null;
  const failedAt = c.failed_at ? new Date(c.failed_at) : null;

  const existing = await prisma.connector.findUnique({
    where: { fivetranId_userId: { fivetranId: id, userId } },
  });

  if (
    existing &&
    existing.succeededAt?.getTime() === succeededAt?.getTime() &&
    existing.failedAt?.getTime() === failedAt?.getTime()
  ) {
    return Response.json({ synced: false });
  }

  let destinationService: string | null = null;
  if (c.group_id) {
    try {
      const group = await fetchGroupFromFivetran(c.group_id, authHeader);
      destinationService = group.service ?? null;
    } catch {
      // non-critical
    }
  }

  const connector = await prisma.connector.upsert({
    where: { fivetranId_userId: { fivetranId: id, userId } },
    create: {
      fivetranId: id,
      userId,
      service: c.service,
      paused: c.paused,
      syncFrequency: c.sync_frequency,
      schemaChangeHandling: c.schema_change_handling,
      setupState: c.status?.setup_state ?? "unknown",
      syncState: c.status?.sync_state ?? "unknown",
      succeededAt,
      failedAt,
      schemaPrefix: c.schema ?? null,
      groupId: c.group_id ?? null,
      destinationService,
      lastSyncedFromApi: new Date(),
    },
    update: {
      service: c.service,
      paused: c.paused,
      syncFrequency: c.sync_frequency,
      schemaChangeHandling: c.schema_change_handling,
      setupState: c.status?.setup_state ?? "unknown",
      syncState: c.status?.sync_state ?? "unknown",
      succeededAt,
      failedAt,
      schemaPrefix: c.schema ?? null,
      groupId: c.group_id ?? null,
      destinationService,
      lastSyncedFromApi: new Date(),
    },
  });

  const setupState = c.status?.setup_state ?? "unknown";
  const syncState = c.status?.sync_state ?? "unknown";
  const status = syncState === "sync_failed" || setupState === "broken" ? "failure" : "success";

  const details = await fetchLatestSyncDetails(id, authHeader).catch(() => null);

  await prisma.syncEvent.create({
    data: {
      connectorId: connector.id,
      fivetranId: id,
      status,
      startedAt: succeededAt ?? failedAt ?? new Date(),
      completedAt: succeededAt ?? failedAt ?? new Date(),
      rowsSynced: details?.rowsSynced ?? null,
      syncType: details?.syncType ?? null,
      syncMetrics: (details?.syncMetrics as Prisma.InputJsonValue) ?? undefined,
      errorMessage: status === "failure" ? `setup_state: ${setupState}, sync_state: ${syncState}` : null,
      userId,
    },
  });

  return Response.json({ synced: true });
});
