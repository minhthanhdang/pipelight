import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { SyncAuditResult } from "@/lib/dashboard-types";

export const GET = withAuth(async (session, _req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const audits = await prisma.syncAudit.findMany({
    where: { syncEventId: id, userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const results: SyncAuditResult[] = audits.map((a) => ({
    id: a.id,
    judgement: a.judgement,
    directCause: a.directCause,
    analysis: a.analysis,
    suggestions: JSON.parse(a.suggestions),
    createdAt: a.createdAt.toISOString(),
  }));

  return Response.json(results);
});
