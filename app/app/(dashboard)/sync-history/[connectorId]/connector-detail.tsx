"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/stores/useAIStore";
import SyncEventRow from "../sync-event-row";
import SyncEventDetailModal from "@/components/sync-history/SyncEventDetailModal";
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
import type { ConnectorOption, SyncEventItem } from "@/lib/dashboard-types";
import { AuditChart } from "@/components/sync-history/AuditChart";
import { useSyncEvents, useTriggerSync, useTriggerAudit } from "@/hooks/queries";

export default function ConnectorDetail({
  connector,
}: {
  connector: ConnectorOption;
}) {
  const setChatOpen = useAIStore((s) => s.setChatOpen);
  const setPendingPrompt = useAIStore((s) => s.setPendingPrompt);
  const [selectedEvent, setSelectedEvent] = useState<SyncEventItem | null>(null);
  const [hasRunning, setHasRunning] = useState(false);

  const eventsQuery = useSyncEvents(connector.id, hasRunning);
  const syncMutation = useTriggerSync(connector.fivetranId, connector.id);
  const auditMutation = useTriggerAudit(connector.id);

  const allEvents = eventsQuery.data?.pages.flatMap((p) => p.events) ?? [];

  const nextHasRunning = allEvents.some((e) => e.auditStatus === "running");
  if (nextHasRunning !== hasRunning) {
    setHasRunning(nextHasRunning);
  }

  function handleAction(action: "audit" | "chat", event: SyncEventItem) {
    if (action === "audit") {
      auditMutation.mutate(event.id);
      return;
    }

    const statusText = event.status === "success" ? "succeeded" : "failed";
    const prompt = `Tell me about the sync event for connector ${event.connectorService} (${event.fivetranId}) that ${statusText} at ${event.startedAt}.`;
    setPendingPrompt(prompt);
    setChatOpen(true);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px] flex-1">
      <div className="flex flex-col gap-6 min-h-0">
        <div>
          <AuditChart connectorId={connector.id} />
        </div>
        <Card className="flex-1 min-h-0">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Sync Events</CardTitle>
            <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} size="sm" variant="outline">
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              Sync from Fivetran
            </Button>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-auto">
            {eventsQuery.isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : allEvents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No sync events found.
              </div>
            ) : (
              <>
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Audit</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEvents.map((e) => (
                      <SyncEventRow key={e.id} event={e} onAction={handleAction} onSelect={setSelectedEvent} />
                    ))}
                  </TableBody>
                </Table>
                {eventsQuery.hasNextPage && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => eventsQuery.fetchNextPage()}
                      disabled={eventsQuery.isFetchingNextPage}
                    >
                      {eventsQuery.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <SyncEventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </div>
  );
}
