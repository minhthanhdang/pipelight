import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createSummarySession, runSummary } from "@/lib/adk";
import { DEFAULT_AGENT_CONFIG, type AgentConfig } from "@/lib/agent-config";

export const POST = withAuth(async (session, req: Request) => {
  const body = await req.json();
  const { connectorId, period } = body as {
    connectorId?: string;
    period: "last_week" | "last_month";
  };

  if (!period || !["last_week", "last_month"].includes(period)) {
    return Response.json({ error: "Invalid period" }, { status: 400 });
  }

  const now = new Date();
  const periodEnd = now;
  const periodStart = new Date(now);
  if (period === "last_week") {
    periodStart.setDate(periodStart.getDate() - 7);
  } else {
    periodStart.setMonth(periodStart.getMonth() - 1);
  }

  let fivetranId: string | null = null;
  if (connectorId) {
    const connector = await prisma.connector.findFirst({
      where: { id: connectorId, userId: session.user.id },
      select: { fivetranId: true },
    });
    if (!connector) {
      return Response.json({ error: "Connector not found" }, { status: 404 });
    }
    fivetranId = connector.fivetranId;
  }

  const whereClause = {
    userId: session.user.id,
    startedAt: { gte: periodStart, lte: periodEnd },
    ...(connectorId ? { connectorId } : {}),
  };

  const [events, audits, connectors] = await Promise.all([
    prisma.syncEvent.findMany({
      where: whereClause,
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        connectorId: true,
        fivetranId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        rowsSynced: true,
        syncType: true,
        syncMetrics: true,
        errorMessage: true,
      },
    }),
    prisma.syncAudit.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: periodStart, lte: periodEnd },
        ...(connectorId ? { connectorId } : {}),
      },
      select: {
        judgement: true,
        directCause: true,
        connectorId: true,
        fivetranId: true,
      },
    }),
    prisma.connector.findMany({
      where: { userId: session.user.id },
      select: { id: true, service: true, fivetranId: true },
    }),
  ]);

  const serviceMap = new Map(connectors.map((c) => [c.id, c.service]));

  const successCount = events.filter((e) => e.status === "success").length;
  const failureCount = events.filter((e) => e.status === "failure").length;
  const totalVolume = events.reduce((sum, e) => sum + (e.rowsSynced ?? 0), 0);

  const perConnector: Record<string, { service: string; successes: number; failures: number; volume: number; syncTypes: Record<string, number> }> = {};
  for (const e of events) {
    if (!perConnector[e.connectorId]) {
      perConnector[e.connectorId] = {
        service: serviceMap.get(e.connectorId) ?? "unknown",
        successes: 0,
        failures: 0,
        volume: 0,
        syncTypes: {},
      };
    }
    const pc = perConnector[e.connectorId];
    if (e.status === "success") pc.successes++;
    else pc.failures++;
    pc.volume += e.rowsSynced ?? 0;
    if (e.syncType) pc.syncTypes[e.syncType] = (pc.syncTypes[e.syncType] ?? 0) + 1;
  }

  const auditDist = { clean: 0, warning: 0, failure: 0 };
  const topCauses: Record<string, number> = {};
  for (const a of audits) {
    if (a.judgement in auditDist) auditDist[a.judgement as keyof typeof auditDist]++;
    topCauses[a.directCause] = (topCauses[a.directCause] ?? 0) + 1;
  }

  const topErrors: Record<string, number> = {};
  for (const e of events) {
    if (e.errorMessage) {
      topErrors[e.errorMessage] = (topErrors[e.errorMessage] ?? 0) + 1;
    }
  }

  const stats = {
    period: { start: periodStart.toISOString(), end: periodEnd.toISOString(), label: period },
    connectorId: connectorId ?? null,
    fivetranId,
    totalSyncs: events.length,
    successCount,
    failureCount,
    totalVolume,
    perConnector,
    auditDistribution: auditDist,
    topDirectCauses: Object.entries(topCauses).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topErrors: Object.entries(topErrors).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };

  const prompt = JSON.stringify(stats);

  const configRow = await prisma.agentConfig.findUnique({ where: { userId: session.user.id } });
  const agentConfig: AgentConfig = configRow
    ? {
        model: configRow.model as AgentConfig["model"],
        temperature: configRow.temperature ?? undefined,
        topP: configRow.topP ?? undefined,
        thinkingLevel: configRow.thinkingLevel as AgentConfig["thinkingLevel"],
        customInstruction: configRow.customInstruction ?? undefined,
      }
    : DEFAULT_AGENT_CONFIG;

  let summaryMarkdown: string;
  try {
    const adkSessionId = await createSummarySession(session.user.id, agentConfig);
    summaryMarkdown = await runSummary(session.user.id, adkSessionId, prompt, agentConfig);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[summary] generation failed:", message);
    const status = message.includes("503") ? 503 : 502;
    return Response.json({ error: message }, { status });
  }

  const saved = await prisma.syncSummary.create({
    data: {
      userId: session.user.id,
      connectorId: connectorId ?? null,
      fivetranId,
      periodStart,
      periodEnd,
      periodLabel: period,
      summary: summaryMarkdown,
      stats,
    },
  });

  return Response.json({
    id: saved.id,
    connectorId: saved.connectorId,
    fivetranId: saved.fivetranId,
    periodStart: saved.periodStart.toISOString(),
    periodEnd: saved.periodEnd.toISOString(),
    periodLabel: saved.periodLabel,
    summary: saved.summary,
    stats: saved.stats as Record<string, unknown> | null,
    createdAt: saved.createdAt.toISOString(),
  });
});
