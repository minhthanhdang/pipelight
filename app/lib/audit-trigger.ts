import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserAuthHeader, FIVETRAN_BASE } from "@/lib/fivetran";
import { createAuditSession, runAudit } from "@/lib/adk";
import { DEFAULT_AGENT_CONFIG, type AgentConfig } from "@/lib/agent-config";

interface TriggerParams {
  syncEventId: string;
  connectorId: string;
  fivetranId: string;
  userId: string;
  webhookPayload: Record<string, unknown>;
  auditId?: string;
}

export async function triggerSyncAudit({
  syncEventId,
  connectorId,
  fivetranId,
  userId,
  webhookPayload,
  auditId,
}: TriggerParams): Promise<void> {
  try {
    const authHeader = await getUserAuthHeader(userId);

    const [connectorRes, schemaRes, recentEvents, previousEvent] =
      await Promise.all([
        fetch(`${FIVETRAN_BASE}/connectors/${fivetranId}`, {
          headers: { Authorization: authHeader },
        }),
        fetch(`${FIVETRAN_BASE}/connectors/${fivetranId}/schemas`, {
          headers: { Authorization: authHeader },
        }),
        prisma.syncEvent.findMany({
          where: { connectorId },
          orderBy: { startedAt: "desc" },
          take: 5,
          select: {
            status: true,
            startedAt: true,
            completedAt: true,
            rowsSynced: true,
            errorMessage: true,
          },
        }),
        prisma.syncEvent.findFirst({
          where: { fivetranId, id: { not: syncEventId } },
          orderBy: { startedAt: "desc" },
          select: { snapshotData: true },
        }),
      ]);

    const connectorDetails = connectorRes.ok
      ? (await connectorRes.json()).data
      : { error: `Failed to fetch: ${connectorRes.status}` };

    const schemaConfig = schemaRes.ok
      ? (await schemaRes.json()).data
      : { error: `Failed to fetch: ${schemaRes.status}` };

    // Fetch column-level config for each enabled table
    const columnConfigs: Record<string, unknown> = {};
    if (schemaConfig.schemas) {
      const columnFetches: Promise<void>[] = [];
      for (const [schemaName, schema] of Object.entries<any>(schemaConfig.schemas)) {
        if (!schema.enabled) continue;
        for (const [tableName, table] of Object.entries<any>(schema.tables ?? {})) {
          if (!table.enabled) continue;
          const key = `${schemaName}.${tableName}`;
          columnFetches.push(
            fetch(
              `${FIVETRAN_BASE}/connectors/${fivetranId}/schemas/${schemaName}/tables/${tableName}/columns`,
              { headers: { Authorization: authHeader } },
            )
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data) columnConfigs[key] = data;
              }),
          );
        }
      }
      await Promise.all(columnFetches);
    }

    const snapshot = {
      sync_event: webhookPayload,
      connector_details: connectorDetails,
      schema_config: schemaConfig,
      column_configs: columnConfigs,
    };

    await prisma.syncEvent.update({
      where: { id: syncEventId },
      data: { snapshotData: snapshot as unknown as Prisma.InputJsonValue, auditStatus: "running" },
    });

    const prompt = JSON.stringify({
      current: snapshot,
      previous: previousEvent?.snapshotData ?? null,
      recent_history: recentEvents,
    });

    const configRow = await prisma.agentConfig.findUnique({ where: { userId } });
    const agentConfig: AgentConfig = configRow
      ? {
          model: configRow.model as AgentConfig["model"],
          temperature: configRow.temperature ?? undefined,
          topP: configRow.topP ?? undefined,
          thinkingLevel: configRow.thinkingLevel as AgentConfig["thinkingLevel"],
          customInstruction: configRow.customInstruction ?? undefined,
        }
      : DEFAULT_AGENT_CONFIG;

    const sessionId = await createAuditSession(userId, agentConfig);
    const result = await runAudit(userId, sessionId, prompt, agentConfig);

    const auditData = {
      judgement: result.judgement,
      directCause: result.directCause,
      analysis: result.analysis,
      suggestions: JSON.stringify(result.suggestions),
    };

    await prisma.$transaction([
      auditId
        ? prisma.syncAudit.update({ where: { id: auditId }, data: auditData })
        : prisma.syncAudit.create({
            data: { syncEventId, connectorId, fivetranId, userId, ...auditData },
          }),
      prisma.syncEvent.update({
        where: { id: syncEventId },
        data: { auditStatus: "done" },
      }),
    ]);

  } catch (err) {
    console.error("[audit] triggerSyncAudit failed:", err);
    await prisma.syncEvent.update({
      where: { id: syncEventId },
      data: { auditStatus: "failed" },
    }).catch(() => {});
  }
}
