import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAdkSession, runSSEWithRetry, APP_NAME } from "@/lib/adk";
import { DEFAULT_AGENT_CONFIG, type AgentConfig } from "@/lib/agent-config";
import { WRITE_TOOLS } from "@/lib/write-tools";

type TappedToolCall = {
  id?: string;
  name: string;
  args: Record<string, unknown>;
};

async function getUserAgentConfig(userId: string): Promise<AgentConfig> {
  const config = await prisma.agentConfig.findUnique({ where: { userId } });
  if (!config) return DEFAULT_AGENT_CONFIG;
  return {
    model: config.model as AgentConfig["model"],
    temperature: config.temperature ?? undefined,
    topP: config.topP ?? undefined,
    thinkingLevel: config.thinkingLevel as AgentConfig["thinkingLevel"],
    customInstruction: config.customInstruction ?? undefined,
  };
}

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

  const agentConfig = await getUserAgentConfig(userId);

  let chatSessionId = existingSessionId;
  let adkSessionId: string;

  if (!chatSessionId) {
    try {
      adkSessionId = await createAdkSession(userId, agentConfig);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isConnErr = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|fetch failed|network/i.test(msg);
      return Response.json(
        { error: isConnErr ? "Model isn't available right now — please try again later" : msg || "Failed to create session" },
        { status: 502 },
      );
    }
    const title = message.length > 50
      ? message.slice(0, 50).replace(/\s+\S*$/, '') + '...'
      : message;
    const chatSession = await prisma.chatSession.create({
      data: { userId, adkSessionId, agentType: "main", title },
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

  let adkRes: Response;
  try {
    adkRes = await runSSEWithRetry(userId, adkSessionId, {
      role: "user",
      parts: [{ text: message }],
    }, agentConfig);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ADK request failed";
    const isConnErr = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|fetch failed|network/i.test(msg);
    return Response.json(
      { error: isConnErr ? "Model isn't available right now — please try again later" : msg },
      { status: 502 },
    );
  }

  if (!adkRes.body) {
    return Response.json({ error: "ADK returned empty response" }, { status: 502 });
  }

  const reader = adkRes.body.getReader();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let agentText = "";
      let buffer = "";
      const toolCalls: TappedToolCall[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          controller.enqueue(value);

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

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
                  if (part.functionCall) {
                    console.log(`[chat] tool call: ${part.functionCall.name}`, JSON.stringify(part.functionCall.args ?? {}).slice(0, 200));
                    toolCalls.push({
                      id: part.functionCall.id,
                      name: part.functionCall.name,
                      args: part.functionCall.args ?? {},
                    });
                  }
                  if (part.functionResponse) {
                    const fr = part.functionResponse;
                    const match = toolCalls.find((tc) =>
                      fr.id ? tc.id === fr.id : tc.name === fr.name,
                    );
                    if (
                      match &&
                      WRITE_TOOLS.includes(match.name) &&
                      fr.response &&
                      typeof fr.response === "object" &&
                      !Array.isArray(fr.response)
                    ) {
                      match.args = { ...match.args, ...fr.response };
                    }
                  }
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
            data: { sessionId: chatSessionId, role: "tool_call", content: JSON.stringify(tc) },
          });
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: chatSessionId })}\n\n`));
      } catch (err) {
        const raw = err instanceof Error ? err.message : "Stream interrupted";
        const isConnErr = /ECONNREFUSED|ECONNRESET|ETIMEDOUT|fetch failed|network/i.test(raw);
        const msg = isConnErr ? "Model isn't available right now — please try again later" : raw;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
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
