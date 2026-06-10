import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { SyncHistoryResponse } from "@/lib/dashboard-types";

const PAGE_SIZE = 20;

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const connectorId = searchParams.get("connectorId");

  const events = await prisma.syncEvent.findMany({
    where: {
      userId: session.user.id,
      ...(connectorId ? { connectorId } : {}),
    },
    orderBy: { startedAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      audits: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { audits: true } },
    },
  });

  const hasMore = events.length > PAGE_SIZE;
  if (hasMore) events.pop();

  const connectorIds = [...new Set(events.map((e) => e.connectorId))];
  const connectors = connectorIds.length
    ? await prisma.connector.findMany({
        where: { id: { in: connectorIds } },
        select: { id: true, service: true },
      })
    : [];
  const serviceMap = new Map(connectors.map((c) => [c.id, c.service]));

  const result: SyncHistoryResponse = {
    events: events.map((e) => ({
      id: e.id,
      connectorId: e.connectorId,
      fivetranId: e.fivetranId,
      status: e.status,
      auditStatus: e.auditStatus,
      startedAt: e.startedAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
      rowsSynced: e.rowsSynced,
      syncType: e.syncType ?? null,
      syncMetrics: (e.syncMetrics as Record<string, unknown>) ?? null,
      errorMessage: e.errorMessage,
      connectorService: serviceMap.get(e.connectorId) ?? "unknown",
      snapshotData: (e.snapshotData as Record<string, unknown>) ?? null,
      auditCount: e._count.audits,
      ...(e.audits[0]
        ? {
            audit: {
              id: e.audits[0].id,
              judgement: e.audits[0].judgement,
              directCause: e.audits[0].directCause,
              analysis: e.audits[0].analysis,
              suggestions: JSON.parse(e.audits[0].suggestions ?? "[]"),
              createdAt: e.audits[0].createdAt.toISOString(),
            },
          }
        : {}),
    })),
    nextCursor: hasMore ? events[events.length - 1].id : null,
  };

  return Response.json(result);
});
