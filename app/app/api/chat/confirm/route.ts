import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { FIVETRAN_BASE, getUserAuthHeader } from "@/lib/fivetran";
import { runSSEWithRetry, APP_NAME } from "@/lib/adk";

export const POST = withAuth(async (session, req: Request) => {
  const { sessionId, toolCallId, toolName, method, url, body, approved, connectorId } = await req.json();
  const userId = session.user.id;

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
  if (!chatSession || chatSession.userId !== userId) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(userId);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  let toolResult: unknown;
  let connectCardUri: string | null = null;

  if (approved) {
    if (toolName === "create_connect_card" && connectorId) {
      const ccRes = await fetch(`${FIVETRAN_BASE}/connections/${connectorId}/connect-card`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connect_card_config: {
            redirect_uri: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/connect-card/callback`,
          },
        }),
      });
      const ccData = await ccRes.json().catch(() => ({ status: ccRes.status }));
      connectCardUri = ccData?.data?.connect_card?.uri ?? ccData?.uri ?? null;
      toolResult = { status: "connect_card_created", uri: connectCardUri };
    } else {
      const fivetranRes = await fetch(`${FIVETRAN_BASE}${url}`, {
        method: method ?? "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      toolResult = await fivetranRes.json().catch(() => ({ status: fivetranRes.status }));
    }
  } else {
    toolResult = { status: "cancelled_by_user" };
  }

  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "tool_result",
      content: JSON.stringify({ toolCallId, approved, result: toolResult }),
    },
  });

  await prisma.aIAction.create({
    data: {
      connectorId: null,
      fivetranId: url ? (url.match(/connectors\/([^/]+)/)?.[1] ?? null) : null,
      action: approved ? `Executed ${method ?? "POST"} ${url}` : `Rejected ${method ?? "POST"} ${url}`,
      toolName: toolCallId,
      input: body ? JSON.stringify(body) : null,
      output: JSON.stringify(toolResult),
      approved: !!approved,
      userId,
    },
  });

  let adkRes: Response;
  try {
    adkRes = await runSSEWithRetry(userId, chatSession.adkSessionId, {
      role: "user",
      parts: [
        {
          functionResponse: {
            id: toolCallId,
            name: toolCallId,
            response: toolResult,
          },
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ADK resume failed";
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

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);

          const chunk = decoder.decode(value, { stream: true });
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
                }
              }
            } catch {
              // non-JSON
            }
          }
        }

        if (agentText) {
          await prisma.chatMessage.create({
            data: { sessionId, role: "agent", content: agentText },
          });
        }
        if (connectCardUri) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ connectCardUri })}\n\n`));
        }
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
