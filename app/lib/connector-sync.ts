import {
  fetchAllGroups,
  fetchConnectorsInGroup,
  fetchConnectorFromFivetran,
  fetchSyncHistory,
  getUserAuthHeader,
  type FivetranSyncHistoryItem,
} from "@/lib/fivetran";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const BACKFILL_LIMIT = 30;
const BACKFILL_STATUSES = new Set(["SUCCESSFUL", "FAILURE", "FAILURE_WITH_TASK"]);

export interface ConnectorSyncResult {
  upserted: number;
  deleted: number;
  failed: number;
  errors: string[];
  backfilledConnectors: number;
  backfilledEvents: number;
}

async function backfillSyncHistory(
  fivetranId: string,
  dbConnectorId: string,
  userId: string,
  authHeader: string,
): Promise<number> {
  const existing = await prisma.syncEvent.count({ where: { fivetranId, userId } });
  if (existing > 0) return 0;

  const items = await fetchSyncHistory(fivetranId, authHeader, BACKFILL_LIMIT);
  const rows = items
    .filter((item) => item.started_at && BACKFILL_STATUSES.has(item.status ?? ""))
    .map((item: FivetranSyncHistoryItem) => {
      const extractVolume = item.stages?.extract?.volume;
      return {
        connectorId: dbConnectorId,
        fivetranId,
        userId,
        status: item.status === "SUCCESSFUL" ? "success" : "failure",
        auditStatus: "none",
        startedAt: new Date(item.started_at as string),
        completedAt: item.completed_at ? new Date(item.completed_at) : null,
        rowsSynced: typeof extractVolume === "number" ? Math.round(extractVolume) : null,
        syncType: item.is_historical_sync ? "historical" : "incremental",
        syncMetrics: item as Prisma.InputJsonValue,
      };
    });

  if (rows.length === 0) return 0;

  const { count } = await prisma.syncEvent.createMany({ data: rows });
  return count;
}

export async function syncConnectorsForUser(userId: string): Promise<ConnectorSyncResult> {
  const authHeader = await getUserAuthHeader(userId);

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
  let backfilledConnectors = 0;
  let backfilledEvents = 0;

  const results = await Promise.allSettled(
    fivetranConnectors.map(async ({ id, group_id, destinationService }) => {
      const c = await fetchConnectorFromFivetran(id, authHeader);

      const dbConnector = await prisma.connector.upsert({
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

      // Backfill failure must not fail the connector upsert
      try {
        const count = await backfillSyncHistory(id, dbConnector.id, userId, authHeader);
        if (count > 0) {
          backfilledConnectors++;
          backfilledEvents += count;
        }
      } catch (err) {
        console.error(`Sync-history backfill failed for ${id}:`, err);
      }

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

  return { upserted, deleted, failed: errors.length, errors, backfilledConnectors, backfilledEvents };
}
