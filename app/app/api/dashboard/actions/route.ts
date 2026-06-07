import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import type { ActionsResponse } from "@/lib/dashboard-types";

const PAGE_SIZE = 20;

export const GET = withAuth(async (session, req: Request) => {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const actions = await prisma.aIAction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = actions.length > PAGE_SIZE;
  if (hasMore) actions.pop();

  const result: ActionsResponse = {
    actions: actions.map((a) => ({
      id: a.id,
      connectorId: a.connectorId,
      fivetranId: a.fivetranId,
      action: a.action,
      toolName: a.toolName,
      approved: a.approved,
      createdAt: a.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? actions[actions.length - 1].id : null,
  };

  return Response.json(result);
});
