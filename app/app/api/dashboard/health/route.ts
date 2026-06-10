import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { HealthResponse, HealthIncidentItem } from "@/lib/dashboard-types";

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

  const [audits, failedSyncs] = await Promise.all([
    prisma.syncAudit.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.syncEvent.findMany({
      where: { userId, status: "failure", startedAt: { gte: since } },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const auditCriticals = audits.filter((a) => a.judgement === "failure").length;
  const auditWarnings = audits.filter((a) => a.judgement === "warning").length;
  const syncFailures = failedSyncs.length;

  const score = Math.max(
    0,
    Math.min(100, 100 - syncFailures * 15 - auditCriticals * 15 - auditWarnings * 5),
  );

  const incidents: HealthIncidentItem[] = [];

  for (const a of audits.filter((a) => a.judgement === "failure")) {
    incidents.push({
      id: a.id,
      fivetranId: a.fivetranId,
      kind: "audit_failure",
      label: a.directCause,
      timestamp: a.createdAt.toISOString(),
    });
  }

  for (const s of failedSyncs) {
    incidents.push({
      id: s.id,
      fivetranId: s.fivetranId,
      kind: "sync_failure",
      label: s.errorMessage ?? "Sync failed",
      timestamp: s.startedAt.toISOString(),
    });
  }

  incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const result: HealthResponse = {
    score,
    syncFailureCount: syncFailures,
    auditWarningCount: auditWarnings,
    auditCriticalCount: auditCriticals,
    recentIncidents: incidents.slice(0, 5),
  };

  return Response.json(result);
});
