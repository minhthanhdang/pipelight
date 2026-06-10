import { withAgentAuth } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export const GET = withAgentAuth(async (userId, req) => {
  const { searchParams } = new URL(req.url);
  const connectorId = searchParams.get("connectorId");
  const fivetranId = searchParams.get("fivetranId");
  const status = searchParams.get("status");
  const auditStatus = searchParams.get("auditStatus");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

  const events = await prisma.syncEvent.findMany({
    where: {
      userId,
      ...(connectorId ? { connectorId } : {}),
      ...(fivetranId ? { fivetranId } : {}),
      ...(status ? { status } : {}),
      ...(auditStatus ? { auditStatus } : {}),
    },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      audits: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const connectorIds = [...new Set(events.map((e) => e.connectorId))];
  const connectors = connectorIds.length
    ? await prisma.connector.findMany({
        where: { id: { in: connectorIds } },
        select: { id: true, service: true, fivetranId: true },
      })
    : [];
  const connectorMap = new Map(connectors.map((c) => [c.id, c]));

  return Response.json({
    events: events.map((e) => {
      const conn = connectorMap.get(e.connectorId);
      return {
        id: e.id,
        connectorId: e.connectorId,
        fivetranId: e.fivetranId,
        connectorService: conn?.service ?? "unknown",
        status: e.status,
        auditStatus: e.auditStatus,
        startedAt: e.startedAt.toISOString(),
        completedAt: e.completedAt?.toISOString() ?? null,
        rowsSynced: e.rowsSynced,
        syncType: e.syncType,
        errorMessage: e.errorMessage,
        latestAudit: e.audits[0]
          ? {
              judgement: e.audits[0].judgement,
              directCause: e.audits[0].directCause,
              createdAt: e.audits[0].createdAt.toISOString(),
            }
          : null,
      };
    }),
  });
});
