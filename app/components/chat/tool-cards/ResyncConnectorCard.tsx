import { AlertTriangle } from "lucide-react";
import type { ToolCall } from "@/hooks/useChat";
import ToolCardBase from "./ToolCardBase";
import ApiRequestDetails from "./ApiRequestDetails";

interface ResyncConnectorCardProps {
  toolCall: ToolCall;
  onConfirm: (approved: boolean) => void;
  disabled: boolean;
}

export default function ResyncConnectorCard({ toolCall, onConfirm, disabled }: ResyncConnectorCardProps) {
  const args = toolCall.args as Record<string, unknown> | undefined;

  return (
    <ToolCardBase
      icon={AlertTriangle}
      iconColor="text-red-500"
      glowColor="bg-red-500/20"
      label="Resync Connector"
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
