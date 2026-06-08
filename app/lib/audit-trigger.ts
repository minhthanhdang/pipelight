import { prisma } from "@/lib/prisma";
import { getUserAuthHeader, FIVETRAN_BASE } from "@/lib/fivetran";
import { createAuditSession, runAudit } from "@/lib/adk";

interface TriggerParams {
  syncEventId: string;
  connectorId: string;
  fivetranId: string;
  userId: string;
  webhookPayload: Record<string, unknown>;
}

export async function triggerSyncAudit({
  syncEventId,
  connectorId,
  fivetranId,
  userId,
  webhookPayload,
}: TriggerParams): Promise<void> {
  try {
    const authHeader = await getUserAuthHeader(userId);

    const [connectorRes, schemaRes, recentEvents] = await Promise.all([
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
    ]);

    const connectorDetails = connectorRes.ok
      ? (await connectorRes.json()).data
      : { error: `Failed to fetch: ${connectorRes.status}` };

    const schemaConfig = schemaRes.ok
      ? (await schemaRes.json()).data
      : { error: `Failed to fetch: ${schemaRes.status}` };

    const prompt = JSON.stringify({
      sync_event: webhookPayload,
      connector_details: connectorDetails,
      schema_config: schemaConfig,
      recent_history: recentEvents,
    });

    const sessionId = await createAuditSession(userId);
    const result = await runAudit(userId, sessionId, prompt);

    await prisma.syncAudit.create({
      data: {
        syncEventId,
        connectorId,
        fivetranId,
        judgement: result.judgement,
        directCause: result.directCause,
        analysis: result.analysis,
        suggestions: JSON.stringify(result.suggestions),
        userId,
      },
    });

    if (result.judgement !== "clean") {
      const existing = await prisma.incident.findFirst({
        where: { fivetranId, userId, resolvedAt: null },
      });
      if (!existing) {
        await prisma.incident.create({
          data: {
            connectorId,
            fivetranId,
            type: result.judgement === "failure" ? "sync_failure" : "data_quality",
            severity: result.judgement === "failure" ? "critical" : "warning",
            title: result.directCause,
            description: result.analysis,
            userId,
          },
        });
      }
    }
  } catch (err) {
    console.error("[audit] triggerSyncAudit failed:", err);
  }
}
