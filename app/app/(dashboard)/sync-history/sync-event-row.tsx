"use client";

import { MoreHorizontal, Search, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/utils";
import type { SyncEventItem } from "@/lib/dashboard-types";

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
  if (auditStatus === "none") return <span className="text-xs text-muted-foreground">—</span>;
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

interface SyncEventRowProps {
  event: SyncEventItem;
  onAction: (action: "audit" | "chat", event: SyncEventItem) => void;
  onSelect: (event: SyncEventItem) => void;
}

export default function SyncEventRow({ event, onAction, onSelect }: SyncEventRowProps) {
  return (
    <TableRow className="cursor-pointer" onClick={() => onSelect(event)}>
      <TableCell><StatusBadge status={event.status} /></TableCell>
      <TableCell className="text-muted-foreground">{timeAgo(event.startedAt)}</TableCell>
      <TableCell className="text-muted-foreground">{timeAgo(event.completedAt)}</TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1">
          <AuditStatusBadge auditStatus={event.auditStatus} judgement={event.audit?.judgement} />
          {(event.auditCount ?? 0) > 1 && (
            <span className="text-[10px] text-muted-foreground">&times;{event.auditCount}</span>
          )}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction("audit", event); }}>
              <Search className="h-4 w-4" />
              Re-run Audit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction("chat", event); }}>
              <MessageCircle className="h-4 w-4" />
              Chat about this
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
