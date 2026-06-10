"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import type { ConnectorOption } from "@/lib/dashboard-types";

function getStatus(c: ConnectorOption) {
  if (c.setupState === "broken") return "broken";
  if (c.paused) return "paused";
  if (c.syncState === "sync_failed") return "failed";
  return c.syncState;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "paused":
      return <Badge variant="secondary">Paused</Badge>;
    case "broken":
    case "failed":
    case "sync_failed":
      return <Badge variant="destructive">{status === "broken" ? "Broken" : "Failed"}</Badge>;
    case "syncing":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Syncing</Badge>;
    case "scheduled":
    case "connected":
      return <Badge className="bg-success/15 text-success hover:bg-success/15">Connected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ConnectorCard({
  connector,
}: {
  connector: ConnectorOption;
}) {
  const status = getStatus(connector);

  return (
    <Link href={`/sync-history/${connector.id}`}>
      <Card className="cursor-pointer hover:border-primary transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">{connector.schemaPrefix ?? connector.label}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {connector.schemaPrefix ? connector.label : connector.service}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <StatusBadge status={status} />
          <span className="text-xs text-muted-foreground">
            {connector.succeededAt ? `Synced ${timeAgo(connector.succeededAt)}` : "Never synced"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
