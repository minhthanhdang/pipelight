"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/stores/useAIStore";
import SyncEventRow from "./sync-event-row";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { SyncEventItem, SyncHistoryResponse } from "@/lib/dashboard-types";

interface ConnectorOption {
  id: string;
  service: string;
}

export default function SyncHistoryClient({
  connectors,
}: {
  connectors: ConnectorOption[];
}) {
  const setChatOpen = useAIStore((s) => s.setChatOpen);
  const setPendingPrompt = useAIStore((s) => s.setPendingPrompt);

  function handleAction(action: "audit" | "chat", event: SyncEventItem) {
    const statusText = event.status === "success" ? "succeeded" : "failed";
    let prompt: string;
    if (action === "chat") {
      prompt = `Tell me about the sync event for connector ${event.connectorService} (${event.fivetranId}) that ${statusText} at ${event.startedAt}.`;
    } else {
      prompt = `Run a data quality audit for connector ${event.connectorService} (${event.fivetranId}). The last sync ${statusText} at ${event.startedAt}. Check for schema drift, missing columns, and row count anomalies.`;
    }
    setPendingPrompt(prompt);
    setChatOpen(true);
  }
  const [events, setEvents] = useState<SyncEventItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connectorFilter, setConnectorFilter] = useState<string>("all");

  const fetchEvents = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (connectorFilter !== "all") params.set("connectorId", connectorFilter);
      const qs = params.toString();
      const res = await fetchWithAuth(`/api/sync-history${qs ? `?${qs}` : ""}`);
      return (await res.json()) as SyncHistoryResponse;
    },
    [connectorFilter]
  );

  useEffect(() => {
    setLoading(true);
    fetchEvents().then((data) => {
      setEvents(data.events);
      setNextCursor(data.nextCursor);
      setLoading(false);
    });
  }, [fetchEvents]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    const data = await fetchEvents(nextCursor);
    setEvents((prev) => [...prev, ...data.events]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sync History</h1>
        <p className="text-muted-foreground">Past sync runs and their outcomes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Sync Events</CardTitle>
              <Select value={connectorFilter} onValueChange={(v) => setConnectorFilter(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue>
                    {connectorFilter === "all"
                      ? "All connectors"
                      : connectors.find((c) => c.id === connectorFilter)?.service ?? connectorFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All connectors</SelectItem>
                  {connectors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : events.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No sync events found.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Connector</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Rows Synced</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((e) => (
                        <SyncEventRow key={e.id} event={e} onAction={handleAction} />
                      ))}
                    </TableBody>
                  </Table>
                  {nextCursor && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
