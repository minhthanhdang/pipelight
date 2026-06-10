"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, LifeBuoy, Loader2 } from "lucide-react";
import { useAIStore } from "@/stores/useAIStore";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { SyncEventItem, SyncAuditResult } from "@/lib/dashboard-types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  return `${(bytes / k ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "success":
      return <Badge className="bg-success/15 text-success hover:bg-success/15">Success</Badge>;
    case "failure":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function AuditStatusBadge({ auditStatus, judgement }: { auditStatus: string; judgement?: string }) {
  if (auditStatus === "done" && judgement) {
    switch (judgement) {
      case "clean":
        return <Badge className="bg-success/15 text-success hover:bg-success/15">Clean</Badge>;
      case "failure":
        return <Badge variant="destructive">Failure</Badge>;
      case "drift":
        return <Badge className="bg-warning/15 text-warning hover:bg-warning/15">Drift</Badge>;
      default:
        return <Badge variant="outline">{judgement}</Badge>;
    }
  }
  switch (auditStatus) {
    case "running":
      return <Badge className="bg-blue-500/15 text-blue-500 hover:bg-blue-500/15">Running…</Badge>;
    case "failed":
      return <Badge variant="destructive">Audit Failed</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function duration(start: string, end: string | null) {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right min-w-0 break-words">{children}</span>
    </div>
  );
}

interface SyncEventDetailModalProps {
  event: SyncEventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SyncEventDetailModal({ event, open, onOpenChange }: SyncEventDetailModalProps) {
  const setPendingPrompt = useAIStore((s) => s.setPendingPrompt);
  const setChatOpen = useAIStore((s) => s.setChatOpen);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [auditHistory, setAuditHistory] = useState<SyncAuditResult[]>([]);

  async function loadHistory() {
    if (!event) return;
    if (historyOpen) { setHistoryOpen(false); return; }
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetchWithAuth(`/api/sync-history/${event.id}/audits`);
      setAuditHistory(await res.json());
    } catch { setAuditHistory([]); }
    setHistoryLoading(false);
  }

  if (!event) return null;

  const showGetHelp = event.errorMessage || (event.audit && ['warning', 'error'].includes(event.audit.judgement));

  const handleGetHelp = () => {
    const parts: string[] = [
      `I need help with connector ${event.fivetranId} (${event.connectorService}).`,
    ];
    if (event.errorMessage) {
      parts.push(`Error: ${event.errorMessage}`);
    }
    if (event.audit) {
      parts.push(`Audit judgement: ${event.audit.judgement}`);
      parts.push(`Cause: ${event.audit.directCause}`);
      parts.push(`Analysis: ${event.audit.analysis}`);
    }
    parts.push("Please guide me through fixing this step by step.");

    setPendingPrompt(parts.join("\n"));
    setChatOpen(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusBadge status={event.status} />
            <DialogTitle>{event.connectorService}</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{event.fivetranId}</p>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          <Section title="Timing">
            <Row label="Started">{formatDate(event.startedAt)}</Row>
            <Row label="Completed">{formatDate(event.completedAt)}</Row>
            <Row label="Duration">{duration(event.startedAt, event.completedAt)}</Row>
          </Section>

          <Section title="Data">
            <Row label="Data synced">{event.rowsSynced != null ? formatBytes(event.rowsSynced) : "—"}</Row>
            {event.errorMessage && (
              <div className="mt-1 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                {event.errorMessage}
              </div>
            )}
          </Section>

          <Section title="Audit">
            <div className="flex items-center gap-2 mb-1">
              <AuditStatusBadge auditStatus={event.auditStatus} judgement={event.audit?.judgement} />
              {event.audit && <span className="text-sm min-w-0 break-words">{event.audit.directCause}</span>}
              {(event.auditCount ?? 0) > 1 && (
                <span className="text-[10px] text-muted-foreground">({event.auditCount} audits)</span>
              )}
            </div>
            {event.audit && (
              <>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{event.audit.analysis}</p>
                {event.audit.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
                    {event.audit.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-md border p-2 text-xs">
                        <Badge variant="outline" className="shrink-0 text-[10px]">{s.toolName}</Badge>
                        <span>{s.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {(event.auditCount ?? 0) > 1 && (
              <div className="mt-3">
                <button
                  onClick={loadHistory}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {historyOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  Audit History
                </button>
                {historyOpen && (
                  <div className="mt-2 space-y-2">
                    {historyLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      auditHistory.slice(1).map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-md border p-2 text-xs">
                          <AuditStatusBadge auditStatus="done" judgement={a.judgement} />
                          <span className="flex-1 truncate">{a.directCause}</span>
                          <span className="text-muted-foreground shrink-0">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                    {!historyLoading && auditHistory.slice(1).length === 0 && (
                      <p className="text-xs text-muted-foreground">No previous audits.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Section>

          {showGetHelp && (
            <button
              onClick={handleGetHelp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
            >
              <LifeBuoy className="w-4 h-4" />
              Get Help
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
