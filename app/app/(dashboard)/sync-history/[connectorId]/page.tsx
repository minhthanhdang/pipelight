import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getConnectorMeta } from "@/lib/connectors";
import ConnectorDetail from "./connector-detail";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function ConnectorDetailPage({
  params,
}: {
  params: Promise<{ connectorId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { connectorId } = await params;

  const connector = await prisma.connector.findFirst({
    where: { id: connectorId, userId: session.user.id },
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
  });

  if (!connector) notFound();

  const meta = getConnectorMeta(connector.fivetranId);
  const enriched = {
    id: connector.id,
    service: connector.service,
    fivetranId: connector.fivetranId,
    paused: connector.paused,
    setupState: connector.setupState,
    syncState: connector.syncState,
    succeededAt: connector.succeededAt?.toISOString() ?? null,
    failedAt: connector.failedAt?.toISOString() ?? null,
    label: meta.label,
    sourceType: meta.sourceType,
    schemaPrefix: connector.schemaPrefix ?? null,
  };

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
                <BreadcrumbLink render={<Link href="/sync-history" />}>
                  Connectors
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{enriched.schemaPrefix ?? enriched.label} Syncs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <p className="text-muted-foreground mt-1">
          Sync events for {enriched.schemaPrefix ?? enriched.label}
        </p>
      </div>

      <ConnectorDetail connector={enriched} />
    </div>
  );
}
