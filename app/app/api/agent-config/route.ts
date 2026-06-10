import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { DEFAULT_AGENT_CONFIG } from "@/lib/agent-config";

export const GET = withAuth(async (session) => {
  const config = await prisma.agentConfig.findUnique({
    where: { userId: session.user.id },
  });

  if (!config) {
    return Response.json(DEFAULT_AGENT_CONFIG);
  }

  return Response.json({
    model: config.model,
    temperature: config.temperature,
    topP: config.topP,
    thinkingLevel: config.thinkingLevel,
    customInstruction: config.customInstruction,
  });
});

export const PUT = withAuth(async (session, req: Request) => {
  const body = await req.json();
  const { model, temperature, topP, thinkingLevel, customInstruction } = body;

  if (!model || typeof model !== "string") {
    return Response.json({ error: "model required" }, { status: 400 });
  }

  const config = await prisma.agentConfig.upsert({
    where: { userId: session.user.id },
    update: { model, temperature, topP, thinkingLevel, customInstruction },
    create: {
      userId: session.user.id,
      model,
      temperature,
      topP,
      thinkingLevel,
      customInstruction,
    },
  });

  return Response.json({
    model: config.model,
    temperature: config.temperature,
    topP: config.topP,
    thinkingLevel: config.thinkingLevel,
    customInstruction: config.customInstruction,
  });
});
