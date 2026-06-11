import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import type { ToolCall } from "@/hooks/useChat";
import ToolCardBase from "./ToolCardBase";
import type { Status } from "./ToolCardBase";

interface ReauthCardProps {
  toolCall: ToolCall;
  onConfirm: (approved: boolean) => void;
  connectCardUri?: string | null;
  disabled: boolean;
  pendingReauth?: boolean;
  onCompleteReauth?: (completed: boolean) => void;
  reauthError?: string | null;
}

export default function ReauthCard({
  toolCall,
  onConfirm,
  connectCardUri,
  disabled,
  pendingReauth,
  onCompleteReauth,
  reauthError,
}: ReauthCardProps) {
  const [completing, setCompleting] = useState(false);
  const args = toolCall.args as Record<string, unknown> | undefined;

  const handleConfirm = (approved: boolean) => {
    if (approved && connectCardUri) {
      window.open(connectCardUri, "_blank");
    }
    onConfirm(approved);
  };

  const renderStatus = (status: Status) => {
    if (status === "confirmed" && pendingReauth) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-blue-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            Re-authorizing in new tab...
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setCompleting(true); onCompleteReauth?.(true); }}
              disabled={completing}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {completing ? "Completing…" : "Done"}
            </button>
            <button
              onClick={() => onCompleteReauth?.(false)}
              disabled={completing}
              className="rounded-md border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ToolCardBase
      icon={Plus}
      iconColor="text-blue-500"
      glowColor="bg-blue-500/20"
      label="Re-authorize Connector"
      warning={args?.warning as string | undefined}
      onConfirm={handleConfirm}
      disabled={disabled || !connectCardUri}
      error={reauthError}
      renderStatus={renderStatus}
    />
  );
}
