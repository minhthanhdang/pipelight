import { withAuth } from "@/lib/auth-middleware";
import {
  fetchAllGroups,
  fetchConnectorsInGroup,
  fetchConnectorFromFivetran,
  getUserAuthHeader,
} from "@/lib/fivetran";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (session) => {
  const userId = session.user.id;
  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(userId);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  const groups = await fetchAllGroups(authHeader);

  const fivetranConnectors: { id: string; group_id: string; destinationService: string | null }[] = [];
  for (const group of groups) {
    const items = await fetchConnectorsInGroup(group.id, authHeader);
    for (const item of items) {
      fivetranConnectors.push({
        id: item.id,
        group_id: group.id,
        destinationService: group.service ?? null,
      });
    }
  }

  const errors: string[] = [];
  let upserted = 0;

  const results = await Promise.allSettled(
    fivetranConnectors.map(async ({ id, group_id, destinationService }) => {
      const c = await fetchConnectorFromFivetran(id, authHeader);

      await prisma.connector.upsert({
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
          schemaPrefix: c.schema ?? null,
          groupId: group_id,
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
          succeededAt: c.succeeded_at ? new Date(c.succeeded_at) : null,
          failedAt: c.failed_at ? new Date(c.failed_at) : null,
          schemaPrefix: c.schema ?? null,
          groupId: group_id,
          destinationService,
          lastSyncedFromApi: new Date(),
        },
      });

      return id;
    }),
  );

  for (const r of results) {
    if (r.status === "fulfilled") {
      upserted++;
    } else {
      console.error("Connector refresh failed:", r.reason);
      errors.push(r.reason?.message ?? "Unknown error");
    }
  }

  // Delete connectors no longer in Fivetran
  const liveFivetranIds = fivetranConnectors.map((c) => c.id);
  const { count: deleted } = await prisma.connector.deleteMany({
    where: {
      userId,
      fivetranId: { notIn: liveFivetranIds },
    },
  });

  return Response.json({ upserted, deleted, failed: errors.length, errors });
});
