import { Play } from "lucide-react";
import type { ToolCall } from "@/hooks/useChat";
import ToolCardBase from "./ToolCardBase";
import ApiRequestDetails from "./ApiRequestDetails";

interface TriggerSyncCardProps {
  toolCall: ToolCall;
  onConfirm: (approved: boolean) => void;
  disabled: boolean;
}

export default function TriggerSyncCard({ toolCall, onConfirm, disabled }: TriggerSyncCardProps) {
  const args = toolCall.args as Record<string, unknown> | undefined;

  return (
    <ToolCardBase
      icon={Play}
      iconColor="text-blue-500"
      glowColor="bg-blue-500/20"
      label="Trigger Sync"
      warning={args?.warning as string | undefined}
      onConfirm={onConfirm}
      disabled={disabled}
    >
      <ApiRequestDetails
        method={args?.method as string | undefined}
        url={args?.url as string | undefined}
        body={args?.body as Record<string, unknown> | undefined}
      />
    </ToolCardBase>
  );
}
