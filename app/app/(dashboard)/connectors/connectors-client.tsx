"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeAgo } from "@/lib/utils";

interface ConnectorRow {
  id: string;
  service: string;
  paused: boolean;
  setupState: string;
  syncState: string;
  schemaChangeHandling: string;
  succeededAt: string | null;
  failedAt: string | null;
  lastSyncedFromApi: string;
  label: string;
  sourceType: string;
  schemaPrefix: string | null;
  destinationService: string | null;
}

const DESTINATION_LABELS: Record<string, string> = {
  big_query: "BigQuery",
  snowflake: "Snowflake",
  redshift: "Redshift",
  databricks: "Databricks",
  postgres: "Postgres",
};

function formatDestination(raw: string | null) {
  if (!raw) return "—";
  return DESTINATION_LABELS[raw] ?? raw.replace(/_/g, " ");
}

type SortKey = "label" | "service" | "status" | "succeededAt" | "schemaChangeHandling";
type SortDir = "asc" | "desc";

function getStatus(c: ConnectorRow) {
  if (c.setupState === "broken") return "broken";
  if (c.paused) return "paused";
  if (c.syncState === "sync_failed") return "failed";
  return c.syncState;
}

function StatusBadge({ connector }: { connector: ConnectorRow }) {
  const status = getStatus(connector);

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

function sortRows(rows: ConnectorRow[], key: SortKey, dir: SortDir) {
  return [...rows].sort((a, b) => {
    let av: string, bv: string;
    switch (key) {
      case "label": av = a.schemaPrefix ?? a.label; bv = b.schemaPrefix ?? b.label; break;
      case "service": av = a.service; bv = b.service; break;
      case "status": av = getStatus(a); bv = getStatus(b); break;
      case "succeededAt": av = a.succeededAt ?? ""; bv = b.succeededAt ?? ""; break;
      case "schemaChangeHandling": av = a.schemaChangeHandling; bv = b.schemaChangeHandling; break;
    }
    const cmp = av.localeCompare(bv);
    return dir === "asc" ? cmp : -cmp;
  });
}

function SortButton({
  column,
  activeKey,
  onToggle,
  children,
}: {
  column: SortKey;
  activeKey: SortKey;
  onToggle: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onToggle(column)}
      className={`flex items-center gap-1 hover:text-foreground transition-colors ${activeKey === column ? "text-foreground" : ""}`}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}

export default function ConnectorsClient({ connectors }: { connectors: ConnectorRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const loading = refreshing || isPending;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchWithAuth("/api/connectors/sync", { method: "POST" });
      startTransition(() => router.refresh());
    } finally {
      setRefreshing(false);
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = sortRows(connectors, sortKey, sortDir);
  const lastSynced = connectors.length > 0
    ? connectors.reduce((latest, c) =>
        c.lastSyncedFromApi > latest ? c.lastSyncedFromApi : latest,
        connectors[0].lastSyncedFromApi
      )
    : null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connectors</h1>
          <p className="mt-2 text-muted-foreground">
            {lastSynced ? `Your Fivetran Connectors. Last refresh ${timeAgo(lastSynced)}` : "Your Fivetran Connectors"}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <Card>
        <CardContent>
          {connectors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No connectors synced yet. Click &quot;Refresh&quot; to fetch from Fivetran.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortButton column="label" activeKey={sortKey} onToggle={toggleSort}>Name</SortButton></TableHead>
                  <TableHead><SortButton column="service" activeKey={sortKey} onToggle={toggleSort}>Service</SortButton></TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead><SortButton column="status" activeKey={sortKey} onToggle={toggleSort}>Status</SortButton></TableHead>
                  <TableHead><SortButton column="succeededAt" activeKey={sortKey} onToggle={toggleSort}>Last Sync</SortButton></TableHead>
                  <TableHead><SortButton column="schemaChangeHandling" activeKey={sortKey} onToggle={toggleSort}>Schema Handling</SortButton></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{c.schemaPrefix ?? c.label}</span>
                        {c.schemaPrefix && (
                          <span className="block text-xs text-muted-foreground">{c.label}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.service}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDestination(c.destinationService)}</TableCell>
                    <TableCell><StatusBadge connector={c} /></TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(c.succeededAt)}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.schemaChangeHandling}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
