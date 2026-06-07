import { withAuth } from "@/lib/auth-middleware";
import { fetchConnectorFromFivetran, getUserAuthHeader } from "@/lib/fivetran";
import { CONNECTOR_MAP } from "@/lib/connectors";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (session) => {
  const userId = session.user.id;
  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(userId);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  const allIds = Object.values(CONNECTOR_MAP).flatMap((m) => m.connectorIds);

  const results = await Promise.allSettled(
    allIds.map(async (id) => {
      const c = await fetchConnectorFromFivetran(id, authHeader);

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
          succeededAt: c.succeeded_at ? new Date(c.succeeded_at) : null,
          failedAt: c.failed_at ? new Date(c.failed_at) : null,
          lastSyncedFromApi: new Date(),
        },
        update: {
          service: c.service,
          paused: c.paused,
          syncFrequency: c.sync_frequency,
          schemaChangeHandling: c.schema_change_handling,
          setupState: c.status?.setup_state ?? "unknown",
          syncState: c.status?.sync_state ?? "unknown",
          succeededAt: c.succeeded_at ? new Date(c.succeeded_at) : null,
          failedAt: c.failed_at ? new Date(c.failed_at) : null,
          lastSyncedFromApi: new Date(),
        },
      });

      const syncState = c.status?.sync_state ?? "unknown";
      const setupState = c.status?.setup_state ?? "unknown";
      const status = syncState === "sync_failed" || setupState === "broken" ? "failure" : "success";

      await prisma.syncEvent.create({
        data: {
          connectorId: connector.id,
          fivetranId: id,
          status,
          startedAt: new Date(),
          completedAt: new Date(),
          errorMessage: status === "failure" ? `setup_state: ${setupState}, sync_state: ${syncState}` : null,
          userId,
        },
      });

      if (setupState === "broken" || syncState === "sync_failed") {
        const existing = await prisma.incident.findFirst({
          where: { fivetranId: id, userId, resolvedAt: null },
        });
        if (!existing) {
          await prisma.incident.create({
            data: {
              connectorId: connector.id,
              fivetranId: id,
              type: setupState === "broken" ? "connection_failure" : "data_quality",
              severity: "critical",
              title: setupState === "broken"
                ? `Connection broken: ${c.service} (${id})`
                : `Sync failed: ${c.service} (${id})`,
              description: `setup_state: ${setupState}, sync_state: ${syncState}`,
              userId,
            },
          });
        }
      }

      return id;
    })
  );

  const errors: string[] = [];
  let synced = 0;
  for (const r of results) {
    if (r.status === "fulfilled") synced++;
    else {
      console.error("Sync failed:", r.reason);
      errors.push(r.reason?.message ?? "Unknown error");
    }
  }

  return Response.json({ synced, failed: errors.length, errors });
});
