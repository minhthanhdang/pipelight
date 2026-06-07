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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
    case "failure":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface SyncEventRowProps {
  event: SyncEventItem;
  onAction: (action: "audit" | "chat", event: SyncEventItem) => void;
}

export default function SyncEventRow({ event, onAction }: SyncEventRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{event.connectorService}</TableCell>
      <TableCell><StatusBadge status={event.status} /></TableCell>
      <TableCell className="text-muted-foreground">{timeAgo(event.startedAt)}</TableCell>
      <TableCell className="text-muted-foreground">{timeAgo(event.completedAt)}</TableCell>
      <TableCell className="text-muted-foreground">{event.rowsSynced ?? "—"}</TableCell>
      <TableCell className="text-destructive text-xs max-w-48 truncate">
        {event.errorMessage ?? "—"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAction("audit", event)}>
              <Search className="h-4 w-4" />
              Run Audit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("chat", event)}>
              <MessageCircle className="h-4 w-4" />
              Chat about this
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
