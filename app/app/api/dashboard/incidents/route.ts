import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { IncidentsResponse, IncidentsByConnector } from "@/lib/dashboard-types";

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

  const [failedSyncs, failedAudits] = await Promise.all([
    prisma.syncEvent.findMany({
      where: { userId, status: "failure", startedAt: { gte: since } },
      select: { fivetranId: true },
    }),
    prisma.syncAudit.findMany({
      where: { userId, judgement: "failure", createdAt: { gte: since } },
      select: { fivetranId: true },
    }),
  ]);

  const map = new Map<string, { syncFailures: number; auditCriticals: number }>();

  for (const s of failedSyncs) {
    const entry = map.get(s.fivetranId) ?? { syncFailures: 0, auditCriticals: 0 };
    entry.syncFailures++;
    map.set(s.fivetranId, entry);
  }

  for (const a of failedAudits) {
    const entry = map.get(a.fivetranId) ?? { syncFailures: 0, auditCriticals: 0 };
    entry.auditCriticals++;
    map.set(a.fivetranId, entry);
  }

  const sorted = [...map.entries()]
    .sort((a, b) => (b[1].syncFailures + b[1].auditCriticals) - (a[1].syncFailures + a[1].auditCriticals))
    .slice(0, 5);

  const fivetranIds = sorted.map(([id]) => id);
  const connectors = await prisma.connector.findMany({
    where: { fivetranId: { in: fivetranIds }, userId },
    select: { fivetranId: true, service: true },
  });
  const serviceMap = new Map(connectors.map((c) => [c.fivetranId, c.service]));

  const result: IncidentsResponse = {
    connectors: sorted.map(([fivetranId, counts]): IncidentsByConnector => ({
      fivetranId,
      service: serviceMap.get(fivetranId) ?? fivetranId,
      syncFailures: counts.syncFailures,
      auditCriticals: counts.auditCriticals,
    })),
  };

  return Response.json(result);
});
