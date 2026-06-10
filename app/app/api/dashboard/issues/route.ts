import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (session) => {
  const audits = await prisma.syncAudit.findMany({
    where: {
      userId: session.user.id,
      judgement: { in: ["warning", "failure"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return Response.json(
    audits.map((a) => ({
      id: a.id,
      syncEventId: a.syncEventId,
      fivetranId: a.fivetranId,
      judgement: a.judgement,
      directCause: a.directCause,
      analysis: a.analysis,
      createdAt: a.createdAt.toISOString(),
    })),
  );
});
