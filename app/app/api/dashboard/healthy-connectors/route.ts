import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { HealthyConnectorsResponse } from "@/lib/dashboard-types";

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "quarter":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  }
}

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "week";
  const since = getPeriodStart(period);
  const userId = session.user.id;

  const [connectors, failedSyncs, failedAudits] = await Promise.all([
    prisma.connector.findMany({
      where: {
        userId,
        setupState: "connected",
        syncState: "synced",
        paused: false,
      },
      select: { fivetranId: true, service: true, succeededAt: true },
    }),
    prisma.syncEvent.findMany({
      where: { userId, status: "failure", startedAt: { gte: since } },
      select: { fivetranId: true },
    }),
    prisma.syncAudit.findMany({
      where: { userId, judgement: "failure", createdAt: { gte: since } },
      select: { fivetranId: true },
    }),
  ]);

  const incidentIds = new Set<string>();
  for (const s of failedSyncs) incidentIds.add(s.fivetranId);
  for (const a of failedAudits) incidentIds.add(a.fivetranId);

  const healthy = connectors
    .filter((c) => !incidentIds.has(c.fivetranId))
    .sort((a, b) => {
      if (!a.succeededAt) return 1;
      if (!b.succeededAt) return -1;
      return b.succeededAt.getTime() - a.succeededAt.getTime();
    })
    .slice(0, 5);

  const result: HealthyConnectorsResponse = {
    connectors: healthy.map((c) => ({
      fivetranId: c.fivetranId,
      service: c.service,
      lastSyncedAt: c.succeededAt?.toISOString() ?? null,
    })),
  };

  return Response.json(result);
});
