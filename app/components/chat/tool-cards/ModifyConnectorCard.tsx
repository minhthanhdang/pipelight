import { Pencil } from "lucide-react";
import type { ToolCall } from "@/hooks/useChat";
import ToolCardBase from "./ToolCardBase";
import ApiRequestDetails from "./ApiRequestDetails";

interface ModifyConnectorCardProps {
  toolCall: ToolCall;
  onConfirm: (approved: boolean) => void;
  disabled: boolean;
}

export default function ModifyConnectorCard({ toolCall, onConfirm, disabled }: ModifyConnectorCardProps) {
  const args = toolCall.args as Record<string, unknown> | undefined;

  return (
    <ToolCardBase
      icon={Pencil}
      iconColor="text-yellow-500"
      glowColor="bg-yellow-500/20"
      label="Modify Connector"
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
