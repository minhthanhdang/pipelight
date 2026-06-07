import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CONNECTOR_MAP } from "@/lib/connectors";
import ConnectorsClient from "./connectors-client";

function getConnectorMeta(fivetranId: string) {
  for (const mapping of Object.values(CONNECTOR_MAP)) {
    if (mapping.connectorIds.includes(fivetranId as never)) {
      return { label: mapping.label, sourceType: mapping.type };
    }
  }
  return { label: fivetranId, sourceType: "unknown" };
}

export default async function ConnectorsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const connectors = await prisma.connector.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const rows = connectors.map((c) => {
    const meta = getConnectorMeta(c.fivetranId);
    return {
      id: c.fivetranId,
      service: c.service,
      paused: c.paused,
      setupState: c.setupState,
      syncState: c.syncState,
      schemaChangeHandling: c.schemaChangeHandling,
      succeededAt: c.succeededAt?.toISOString() ?? null,
      failedAt: c.failedAt?.toISOString() ?? null,
      lastSyncedFromApi: c.lastSyncedFromApi.toISOString(),
      label: meta.label,
      sourceType: meta.sourceType,
    };
  });

  return <ConnectorsClient connectors={rows} />;
}
