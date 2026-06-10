"use client";

import { useState } from "react";
import {
  Pencil,
  Play,
  AlertTriangle,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { ToolCall } from "@/hooks/useChat";

type ActionConfig = {
  label: string;
  icon: typeof Pencil;
  iconColor: string;
  glowColor: string;
};

const actionMap: Record<string, ActionConfig> = {
  modify_connector: {
    label: "Modify Connector",
    icon: Pencil,
    iconColor: "text-yellow-500",
    glowColor: "bg-yellow-500/20",
  },
  modify_schema_config: {
    label: "Modify Schema Config",
    icon: Pencil,
    iconColor: "text-yellow-500",
    glowColor: "bg-yellow-500/20",
  },
  trigger_sync: {
    label: "Trigger Sync",
    icon: Play,
    iconColor: "text-blue-500",
    glowColor: "bg-blue-500/20",
  },
  resync_connector: {
    label: "Resync Connector",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    glowColor: "bg-red-500/20",
  },
  create_connect_card: {
    label: "Re-authorize Connector",
    icon: Plus,
    iconColor: "text-blue-500",
    glowColor: "bg-blue-500/20",
  },
};

interface ToolConfirmCardProps {
  toolCall: ToolCall;
  onConfirm: (approved: boolean) => void;
  disabled: boolean;
}

export default function ToolConfirmCard({
  toolCall,
  onConfirm,
  disabled,
}: ToolConfirmCardProps) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">(
    "pending"
  );
  const [open, setOpen] = useState(false);

  const config = actionMap[toolCall.name] ?? actionMap.modify_connector;
  const Icon = config.icon;

  const args = toolCall.args as Record<string, unknown> | undefined;
  const warning = args?.warning as string | undefined;
  const method = args?.method as string | undefined;
  const url = args?.url as string | undefined;
  const body = args?.body as Record<string, unknown> | undefined;
  const isConnectCard = toolCall.name === "create_connect_card";

  const handleAction = (approved: boolean) => {
    setStatus(approved ? "confirmed" : "cancelled");
    onConfirm(approved);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card text-sm">
        {/* Glassmorphic blur glow */}
        <div
          className={`pointer-events-none absolute -bottom-6 -right-6 h-32 w-48 rounded-full ${config.glowColor} blur-3xl`}
        />

        {/* Trigger row */}
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40">
            <Icon className={`h-4 w-4 shrink-0 ${config.iconColor}`} />
            <span className="flex-1 text-sm text-card-foreground">
              AI Assistant wants to{" "}
              <span className="font-semibold">{config.label}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        {/* Expanded details */}
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-4 py-3">
            {warning && (
              <p className="text-sm text-muted-foreground">{warning}</p>
            )}

            {!isConnectCard && method && url && (
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-card-foreground">
                  {method}
                </code>
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {url}
                </code>
              </div>
            )}

            {!isConnectCard && body && Object.keys(body).length > 0 && (
              <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs text-muted-foreground">
                {JSON.stringify(body, null, 2)}
              </pre>
            )}

            {status === "pending" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleAction(true)}
                  disabled={disabled}
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleAction(false)}
                  disabled={disabled}
                  className="rounded-md border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {status === "confirmed" && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                {disabled && <Loader2 className="h-3 w-3 animate-spin" />}
                {disabled ? "Executing..." : "Confirmed"}
              </div>
            )}

            {status === "cancelled" && (
              <p className="text-xs text-muted-foreground">Cancelled</p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
