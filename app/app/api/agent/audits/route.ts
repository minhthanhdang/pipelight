import { withAgentAuth } from "@/lib/agent-auth";
import { prisma } from "@/lib/prisma";

export const GET = withAgentAuth(async (userId, req) => {
  const { searchParams } = new URL(req.url);
  const syncEventId = searchParams.get("syncEventId");
  const fivetranId = searchParams.get("fivetranId");
  const judgement = searchParams.get("judgement");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

  if (!syncEventId && !fivetranId) {
    return Response.json(
      { error: "syncEventId or fivetranId required" },
      { status: 400 },
    );
  }

  const audits = await prisma.syncAudit.findMany({
    where: {
      userId,
      ...(syncEventId ? { syncEventId } : {}),
      ...(fivetranId ? { fivetranId } : {}),
      ...(judgement ? { judgement } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      syncEvent: {
        select: { status: true, startedAt: true, completedAt: true },
      },
    },
  });

  return Response.json({
    audits: audits.map((a) => ({
      id: a.id,
      syncEventId: a.syncEventId,
      connectorId: a.connectorId,
      fivetranId: a.fivetranId,
      judgement: a.judgement,
      directCause: a.directCause,
      analysis: a.analysis,
      suggestions: JSON.parse(a.suggestions),
      createdAt: a.createdAt.toISOString(),
      syncEvent: {
        status: a.syncEvent.status,
        startedAt: a.syncEvent.startedAt.toISOString(),
        completedAt: a.syncEvent.completedAt?.toISOString() ?? null,
      },
    })),
  });
});
