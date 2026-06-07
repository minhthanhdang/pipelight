"use client";

import { useState } from "react";
import { Settings, Database, Play, AlertTriangle, Loader2 } from "lucide-react";
import type { ToolCall } from "@/hooks/useChat";

const actionMap: Record<string, { label: string; icon: typeof Settings; color: string; bgColor: string }> = {
  modify_connector: { label: "Modify Connector", icon: Settings, color: "text-action-modify", bgColor: "bg-action-modify/10 border-action-modify/20" },
  modify_schema_config: { label: "Modify Schema Config", icon: Database, color: "text-action-schema", bgColor: "bg-action-schema/10 border-action-schema/20" },
  trigger_sync: { label: "Trigger Sync", icon: Play, color: "text-action-sync", bgColor: "bg-action-sync/10 border-action-sync/20" },
  resync_connector: { label: "Resync Connector", icon: AlertTriangle, color: "text-action-danger", bgColor: "bg-action-danger/10 border-action-danger/20" },
};

interface ToolConfirmCardProps {
  toolCall: ToolCall;
  onConfirm: (approved: boolean) => void;
  disabled: boolean;
}

export default function ToolConfirmCard({ toolCall, onConfirm, disabled }: ToolConfirmCardProps) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending");
  const config = actionMap[toolCall.name] ?? actionMap.modify_connector;
  const Icon = config.icon;

  const handleAction = (approved: boolean) => {
    setStatus(approved ? "confirmed" : "cancelled");
    onConfirm(approved);
  };

  return (
    <div className={`rounded-lg border p-3 ${config.bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>

      {toolCall.args && Object.keys(toolCall.args).length > 0 && (
        <pre className="text-xs text-muted-foreground bg-background/60 rounded p-2 mb-2 overflow-x-auto">
          {JSON.stringify(toolCall.args, null, 2)}
        </pre>
      )}

      {status === "pending" ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction(true)}
            disabled={disabled}
            className="px-3 py-1 text-xs font-medium text-primary-foreground bg-primary rounded hover:bg-primary/90 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => handleAction(false)}
            disabled={disabled}
            className="px-3 py-1 text-xs font-medium text-secondary-foreground bg-secondary rounded border border-border hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : status === "confirmed" ? (
        <div className="flex items-center gap-1 text-xs text-success">
          {disabled && <Loader2 className="w-3 h-3 animate-spin" />}
          {disabled ? "Executing..." : "Confirmed"}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">Cancelled</div>
      )}
    </div>
  );
}
