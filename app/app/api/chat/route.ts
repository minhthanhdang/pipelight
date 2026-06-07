import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAdkSession, runSSE } from "@/lib/adk";

export const POST = withAuth(async (session, req: Request) => {
  const { message, sessionId: existingSessionId } = await req.json();
  if (!message || typeof message !== "string") {
    return Response.json({ error: "message required" }, { status: 400 });
  }

  const userId = session.user.id;

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: session.user.email!,
      name: session.user.name,
      image: session.user.image,
    },
  });

  let chatSessionId = existingSessionId;
  let adkSessionId: string;

  if (!chatSessionId) {
    adkSessionId = await createAdkSession(userId);
    const title = message.length > 50
      ? message.slice(0, 50).replace(/\s+\S*$/, '') + '...'
      : message;
    const chatSession = await prisma.chatSession.create({
      data: { userId, adkSessionId, title },
    });
    chatSessionId = chatSession.id;
  } else {
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
    });
    if (!chatSession || chatSession.userId !== userId) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    adkSessionId = chatSession.adkSessionId;
  }

  await prisma.chatMessage.create({
    data: { sessionId: chatSessionId, role: "user", content: message },
  });

  const adkRes = await runSSE(userId, adkSessionId, {
    role: "user",
    parts: [{ text: message }],
  });

  if (!adkRes.ok || !adkRes.body) {
    return Response.json({ error: "ADK request failed" }, { status: 502 });
  }

  const reader = adkRes.body.getReader();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let agentText = "";
      const toolCalls: string[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          controller.enqueue(value);

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw || raw === "[DONE]") continue;

            try {
              const event = JSON.parse(raw);
              const parts = event?.content?.parts;
              if (parts) {
                for (const part of parts) {
                  if (part.text) agentText += part.text;
                  if (part.functionCall) toolCalls.push(JSON.stringify(part.functionCall));
                }
              }
            } catch {
              // non-JSON SSE line
            }
          }
        }

        if (agentText) {
          await prisma.chatMessage.create({
            data: { sessionId: chatSessionId, role: "agent", content: agentText },
          });
        }
        for (const tc of toolCalls) {
          await prisma.chatMessage.create({
            data: { sessionId: chatSessionId, role: "tool_call", content: tc },
          });
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: chatSessionId })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
