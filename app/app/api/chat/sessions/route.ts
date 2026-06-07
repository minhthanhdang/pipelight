import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (session) => {
  const userId = session.user.id;

  const chatSessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      messages: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  const result = chatSessions.map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updatedAt.toISOString(),
    preview: s.messages[0]?.content?.slice(0, 80) ?? "",
  }));

  return Response.json(result);
});
