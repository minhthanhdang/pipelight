import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { FIVETRAN_BASE, getUserAuthHeader } from "@/lib/fivetran";
import { runSSEWithRetry } from "@/lib/adk";

export const POST = withAuth(async (session, req: Request) => {
  const { sessionId, toolCallId, toolName: rawToolName, method, url, body, approved, connectorId, phase, completed } = await req.json();
  const toolName = rawToolName ?? toolCallId;
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

  // Phase 2: user finished OAuth in Connect Card iframe → resume agent
  if (phase === "complete_connect_card") {
    const toolResult = { status: completed ? "connect_card_completed" : "connect_card_cancelled" };

    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "tool_result",
        content: JSON.stringify({ toolCallId, approved: !!completed, result: toolResult }),
      },
    });

    await prisma.aIAction.create({
      data: {
        connectorId: null,
        fivetranId: null,
        action: completed ? "Connect Card OAuth completed" : "Connect Card OAuth cancelled",
        toolName: toolCallId,
        input: null,
        output: JSON.stringify(toolResult),
        approved: !!completed,
        userId,
      },
    });

    // Resume agent with OAuth result — falls through to SSE streaming below
    let adkRes: Response;
    try {
      adkRes = await runSSEWithRetry(userId, chatSession.adkSessionId, {
        role: "user",
        parts: [
          {
            functionResponse: {
              id: toolCallId,
              name: toolName,
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

    return streamAdkResponse(adkRes, sessionId);
  }

  let toolResult: unknown;

  if (approved) {
    if (toolName === "open_reauth_dialog") {
      if (!connectorId) {
        return Response.json({ error: "Missing connector_id for re-authorization" }, { status: 400 });
      }

      await prisma.aIAction.create({
        data: {
          connectorId: null,
          fivetranId: connectorId,
          action: "Opened Fivetran Connect Card for re-authorization",
          toolName: toolCallId,
          input: JSON.stringify({ connectorId }),
          output: null,
          approved: true,
          userId,
        },
      });

      return Response.json({ toolCallId });
    }

    const fivetranRes = await fetch(`${FIVETRAN_BASE}${url}`, {
      method: method ?? "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    toolResult = await fivetranRes.json().catch(() => ({ status: fivetranRes.status }));
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
            name: toolName,
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

  return streamAdkResponse(adkRes, sessionId);
});

function streamAdkResponse(adkRes: Response, sessionId: string) {
  const reader = adkRes.body!.getReader();
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
}
