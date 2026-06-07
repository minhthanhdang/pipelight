import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { HealthResponse } from "@/lib/dashboard-types";

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

  const incidents = await prisma.incident.findMany({
    where: { userId: session.user.id, detectedAt: { gte: since } },
    orderBy: { detectedAt: "desc" },
  });

  const criticals = incidents.filter((i) => i.severity === "critical").length;
  const warnings = incidents.filter((i) => i.severity === "warning").length;

  const byType: Record<string, number> = {};
  for (const i of incidents) {
    byType[i.type] = (byType[i.type] ?? 0) + 1;
  }

  const score = Math.max(0, Math.min(100, 100 - criticals * 15 - warnings * 5));

  const result: HealthResponse = {
    score,
    incidentCount: criticals,
    warningCount: warnings,
    byType,
    recentIncidents: incidents.slice(0, 5).map((i) => ({
      id: i.id,
      type: i.type,
      severity: i.severity,
      title: i.title,
      detectedAt: i.detectedAt.toISOString(),
    })),
  };

  return Response.json(result);
});
