import type { ComponentType } from "react";
import ModifyConnectorCard from "./ModifyConnectorCard";
import ModifySchemaConfigCard from "./ModifySchemaConfigCard";
import TriggerSyncCard from "./TriggerSyncCard";
import ResyncConnectorCard from "./ResyncConnectorCard";
import ReauthCard from "./ReauthCard";

export const TOOL_CARD_MAP: Record<string, ComponentType<any>> = {
  modify_connector: ModifyConnectorCard,
  modify_schema_config: ModifySchemaConfigCard,
  trigger_sync: TriggerSyncCard,
  resync_connector: ResyncConnectorCard,
  open_reauth_dialog: ReauthCard,
};

export { default as ToolCardBase } from "./ToolCardBase";
export { default as ApiRequestDetails } from "./ApiRequestDetails";
export { ModifyConnectorCard, ModifySchemaConfigCard, TriggerSyncCard, ResyncConnectorCard, ReauthCard };
