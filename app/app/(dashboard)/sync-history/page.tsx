import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getConnectorMeta } from "@/lib/connectors";
import SyncHistoryClient from "./sync-history-client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default async function SyncHistoryPage() {
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
      schemaPrefix: true,
    },
    orderBy: { succeededAt: "desc" },
  });

  let hasKeys = false;
  if (connectors.length === 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { fivetranApiKey: true },
    });
    hasKeys = !!user?.fivetranApiKey;
  }

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
      schemaPrefix: c.schemaPrefix ?? null,
    };
  });

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-medium text-muted-foreground relative -top-px">
            Sync Auditor
          </span>
          <ChevronRightIcon className="size-4 text-muted-foreground/50" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Connectors</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <p className="text-muted-foreground mt-1">
          Select a connector to view sync history
        </p>
      </div>

      <SyncHistoryClient connectors={enriched} hasKeys={hasKeys} />
    </div>
  );
}
