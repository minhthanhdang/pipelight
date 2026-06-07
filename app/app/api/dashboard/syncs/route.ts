import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { SyncStatsResponse } from "@/lib/dashboard-types";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
}

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "week";
  const connectorId = searchParams.get("connectorId");
  const since = getPeriodStart(period);

  const where = {
    userId: session.user.id,
    startedAt: { gte: since },
    ...(connectorId ? { fivetranId: connectorId } : {}),
  };

  const events = await prisma.syncEvent.findMany({ where, orderBy: { startedAt: "asc" } });

  const total = events.length;
  const successes = events.filter((e) => e.status === "success").length;
  const failures = events.filter((e) => e.status === "failure").length;

  const dailyMap = new Map<string, { success: number; failure: number }>();
  for (const e of events) {
    const date = e.startedAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(date) ?? { success: 0, failure: 0 };
    if (e.status === "success") entry.success++;
    else if (e.status === "failure") entry.failure++;
    dailyMap.set(date, entry);
  }
  const daily = Array.from(dailyMap.entries()).map(([date, counts]) => ({ date, ...counts }));

  const failureCounts = new Map<string, number>();
  for (const e of events) {
    if (e.status === "failure") {
      failureCounts.set(e.fivetranId, (failureCounts.get(e.fivetranId) ?? 0) + 1);
    }
  }

  const connectors = await prisma.connector.findMany({
    where: { userId: session.user.id },
    select: { fivetranId: true, service: true },
  });
  const serviceMap = new Map(connectors.map((c) => [c.fivetranId, c.service]));

  const topFailures = Array.from(failureCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([fivetranId, failureCount]) => ({
      fivetranId,
      service: serviceMap.get(fivetranId) ?? "unknown",
      failureCount,
    }));

  const result: SyncStatsResponse = { total, successes, failures, daily, topFailures };
  return Response.json(result);
});
