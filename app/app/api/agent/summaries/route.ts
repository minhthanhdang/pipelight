import { withAgentAuth } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export const GET = withAgentAuth(async (userId, req) => {
  const { searchParams } = new URL(req.url);
  const connectorId = searchParams.get("connectorId");
  const fivetranId = searchParams.get("fivetranId");
  const periodLabel = searchParams.get("periodLabel");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "5", 10), 20);

  const summaries = await prisma.syncSummary.findMany({
    where: {
      userId,
      ...(connectorId ? { connectorId } : {}),
      ...(fivetranId ? { fivetranId } : {}),
      ...(periodLabel ? { periodLabel } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json({
    summaries: summaries.map((s) => ({
      id: s.id,
      connectorId: s.connectorId,
      fivetranId: s.fivetranId,
      periodStart: s.periodStart.toISOString(),
      periodEnd: s.periodEnd.toISOString(),
      periodLabel: s.periodLabel,
      summary: s.summary,
      stats: s.stats,
      createdAt: s.createdAt.toISOString(),
    })),
  });
});
