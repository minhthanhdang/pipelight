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
      startedAt: e.startedAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
      rowsSynced: e.rowsSynced,
      errorMessage: e.errorMessage,
      connectorService: serviceMap.get(e.connectorId) ?? "unknown",
    })),
    nextCursor: hasMore ? events[events.length - 1].id : null,
  };

  return Response.json(result);
});
