import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (session) => {
  const incidents = await prisma.incident.findMany({
    where: { userId: session.user.id, resolvedAt: null },
    orderBy: { detectedAt: "desc" },
  });

  return Response.json(
    incidents.map((i) => ({
      id: i.id,
      connectorId: i.connectorId,
      fivetranId: i.fivetranId,
      type: i.type,
      severity: i.severity,
      title: i.title,
      description: i.description,
      detectedAt: i.detectedAt.toISOString(),
    }))
  );
});
