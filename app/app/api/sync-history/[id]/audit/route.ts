import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { SyncAuditResult } from "@/lib/dashboard-types";

export const GET = withAuth(async (session, _req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const audit = await prisma.syncAudit.findUnique({
    where: { syncEventId: id },
  });

  if (!audit || audit.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const result: SyncAuditResult = {
    id: audit.id,
    judgement: audit.judgement,
    directCause: audit.directCause,
    analysis: audit.analysis,
    suggestions: JSON.parse(audit.suggestions),
    createdAt: audit.createdAt.toISOString(),
  };

  return Response.json(result);
});
