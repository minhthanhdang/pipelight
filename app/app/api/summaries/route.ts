import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { SyncSummariesResponse } from "@/lib/dashboard-types";

const PAGE_SIZE = 20;

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const connectorId = searchParams.get("connectorId");

  const summaries = await prisma.syncSummary.findMany({
    where: {
      userId: session.user.id,
      ...(connectorId ? { connectorId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = summaries.length > PAGE_SIZE;
  if (hasMore) summaries.pop();

  const result: SyncSummariesResponse = {
    summaries: summaries.map((s) => ({
      id: s.id,
      connectorId: s.connectorId,
      fivetranId: s.fivetranId,
      periodStart: s.periodStart.toISOString(),
      periodEnd: s.periodEnd.toISOString(),
      periodLabel: s.periodLabel,
      summary: s.summary,
      stats: (s.stats as Record<string, unknown>) ?? null,
      createdAt: s.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? summaries[summaries.length - 1].id : null,
  };

  return Response.json(result);
});
