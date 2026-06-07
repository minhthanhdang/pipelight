import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { type NextRequest } from "next/server";

export const GET = withAuth(async (session, req: NextRequest) => {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json({ error: "sessionId required" }, { status: 400 });
  }

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
  if (!chatSession || chatSession.userId !== session.user.id) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(messages);
});
