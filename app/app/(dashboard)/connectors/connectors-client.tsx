"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function sortRows(rows: ConnectorRow[], key: SortKey, dir: SortDir) {
  return [...rows].sort((a, b) => {
    let av: string, bv: string;
    switch (key) {
      case "label": av = a.label; bv = b.label; break;
      case "service": av = a.service; bv = b.service; break;
      case "status": av = getStatus(a); bv = getStatus(b); break;
      case "succeededAt": av = a.succeededAt ?? ""; bv = b.succeededAt ?? ""; break;
      case "schemaChangeHandling": av = a.schemaChangeHandling; bv = b.schemaChangeHandling; break;
    }
    const cmp = av.localeCompare(bv);
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function ConnectorsClient({ connectors }: { connectors: ConnectorRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ synced: number; failed: number; errors?: string[] } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const loading = syncing || isPending;

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetchWithAuth("/api/connectors/sync", { method: "POST" });
      const data = await res.json();
      setResult({ synced: data.synced, failed: data.failed, errors: data.errors });
      startTransition(() => router.refresh());
    } finally {
      setSyncing(false);
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

  const SortButton = ({ column, children }: { column: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(column)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Connectors</CardTitle>
            <CardDescription>
              {lastSynced ? `Last synced ${timeAgo(lastSynced)}` : "Not synced yet"}
            </CardDescription>
          </div>
          <Button onClick={handleSync} disabled={loading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync All
          </Button>
        </CardHeader>
        <CardContent>
          {result && (
            <div className="mb-4 rounded-md bg-muted px-4 py-2 text-sm">
              Synced {result.synced} connector{result.synced !== 1 && "s"}
              {result.failed > 0 && `, ${result.failed} failed`}
              {result.errors?.map((e, i) => (
                <div key={i} className="text-destructive text-xs mt-1">{e}</div>
              ))}
            </div>
          )}

          {connectors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No connectors synced yet. Click &quot;Sync All&quot; to fetch from Fivetran.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortButton column="label">Name</SortButton></TableHead>
                  <TableHead><SortButton column="service">Service</SortButton></TableHead>
                  <TableHead><SortButton column="status">Status</SortButton></TableHead>
                  <TableHead><SortButton column="succeededAt">Last Sync</SortButton></TableHead>
                  <TableHead><SortButton column="schemaChangeHandling">Schema Handling</SortButton></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.label}</TableCell>
                    <TableCell className="text-muted-foreground">{c.service}</TableCell>
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
