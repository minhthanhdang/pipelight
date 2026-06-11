"use client";

import { useState, useMemo } from "react";
import ConnectorCard from "./connector-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConnectorOption } from "@/lib/dashboard-types";
import { LoadConnectorsCTA } from "@/components/LoadConnectorsCTA";

type SortBy = "newest" | "name";
type FilterStatus = "all" | "failed" | "paused" | "success";

function getFilterStatus(c: ConnectorOption): FilterStatus {
  if (c.setupState === "broken" || (c.syncState === "sync_failed" && !c.paused))
    return "failed";
  if (c.paused) return "paused";
  return "success";
}

function latestSync(c: ConnectorOption): number {
  const t = c.succeededAt ?? c.failedAt;
  return t ? new Date(t).getTime() : 0;
}

export default function SyncHistoryClient({
  connectors,
  hasKeys,
}: {
  connectors: ConnectorOption[];
  hasKeys: boolean;
}) {
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    let result = connectors;
    if (filterStatus !== "all") {
      result = result.filter((c) => getFilterStatus(c) === filterStatus);
    }
    return [...result].sort((a, b) => {
      if (sortBy === "newest") return latestSync(b) - latestSync(a);
      const nameA = (a.schemaPrefix ?? a.label).toLowerCase();
      const nameB = (b.schemaPrefix ?? b.label).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [connectors, sortBy, filterStatus]);

  if (connectors.length === 0 && hasKeys) {
    return <LoadConnectorsCTA />;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v as SortBy)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            <SelectItem value="newest">Newest sync</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v as FilterStatus)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="success">Healthy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <ConnectorCard key={c.id} connector={c} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No connectors match this filter.
          </p>
        )}
      </div>
    </>
  );
}
