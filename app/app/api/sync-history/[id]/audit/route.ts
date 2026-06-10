import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { triggerSyncAudit } from "@/lib/audit-trigger";
import type { SyncAuditResult } from "@/lib/dashboard-types";

export const GET = withAuth(async (session, _req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const audit = await prisma.syncAudit.findFirst({
    where: { syncEventId: id },
    orderBy: { createdAt: "desc" },
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

export const POST = withAuth(async (session, _req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const event = await prisma.syncEvent.findUnique({
    where: { id },
  });

  if (!event || event.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const [, placeholderAudit] = await prisma.$transaction([
    prisma.syncEvent.update({
      where: { id },
      data: { auditStatus: "running" },
    }),
    prisma.syncAudit.create({
      data: {
        syncEventId: id,
        connectorId: event.connectorId,
        fivetranId: event.fivetranId,
        judgement: "running",
        directCause: "",
        analysis: "",
        suggestions: "[]",
        userId: session.user.id,
      },
    }),
  ]);

  triggerSyncAudit({
    syncEventId: id,
    connectorId: event.connectorId,
    fivetranId: event.fivetranId,
    userId: session.user.id,
    webhookPayload: (event.snapshotData as Record<string, unknown>) ?? {},
    auditId: placeholderAudit.id,
  }).catch((err) => console.error("[audit] background trigger failed:", err));

  return Response.json({ ok: true, auditId: placeholderAudit.id });
});
