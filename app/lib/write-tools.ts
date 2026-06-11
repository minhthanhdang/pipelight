// Agent tools that mutate Fivetran state and require user confirmation.
// Must stay in sync with the LongRunningFunctionTool names in agent/tools/fivetran-write.ts
export const WRITE_TOOLS = [
  "modify_connector",
  "modify_schema_config",
  "trigger_sync",
  "resync_connector",
  "open_reauth_dialog",
];
