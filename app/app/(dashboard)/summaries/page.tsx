import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getConnectorMeta } from "@/lib/connectors";
import SummariesClient from "./summaries-client";

export default async function SummariesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const connectors = await prisma.connector.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      service: true,
      fivetranId: true,
      paused: true,
      setupState: true,
      syncState: true,
      succeededAt: true,
      failedAt: true,
    },
    orderBy: { service: "asc" },
  });

  const enriched = connectors.map((c) => {
    const meta = getConnectorMeta(c.fivetranId);
    return {
      id: c.id,
      service: c.service,
      fivetranId: c.fivetranId,
      paused: c.paused,
      setupState: c.setupState,
      syncState: c.syncState,
      succeededAt: c.succeededAt?.toISOString() ?? null,
      failedAt: c.failedAt?.toISOString() ?? null,
      label: meta.label,
      sourceType: meta.sourceType,
    };
  });

  return <SummariesClient connectors={enriched} />;
}
