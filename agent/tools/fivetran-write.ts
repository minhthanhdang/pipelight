import { LongRunningFunctionTool } from "@google/adk";
import { z } from "zod";

const modifyConnector = new LongRunningFunctionTool({
  name: "modify_connector",
  description:
    "Pause/unpause a connector, change sync frequency, or update connection config. Requires user confirmation",
  parameters: z.object({
    connector_id: z.string().describe("Fivetran connector ID"),
    paused: z.boolean().optional().describe("Pause or unpause the connector"),
    sync_frequency: z
      .number()
      .optional()
      .describe("Sync frequency in minutes"),
    config: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Connection config overrides"),
  }),
  execute: async (input) => {
    const body: Record<string, unknown> = {};
    if (input.paused !== undefined) body.paused = input.paused;
    if (input.sync_frequency !== undefined)
      body.sync_frequency = input.sync_frequency;
    if (input.config !== undefined) body.config = input.config;

    return {
      action: "modify_connector",
      connector_id: input.connector_id,
      method: "PATCH",
      url: `/connectors/${input.connector_id}`,
      body,
      warning: `This will modify connector ${input.connector_id}: ${Object.keys(body).join(", ")}`,
    };
  },
});

const modifySchemaConfig = new LongRunningFunctionTool({
  name: "modify_schema_config",
  description:
    "Change schema_change_handling policy, or enable/disable schemas, tables, or columns. Requires user confirmation",
  parameters: z.object({
    connector_id: z.string().describe("Fivetran connector ID"),
    schema_change_handling: z
      .enum(["ALLOW_ALL", "ALLOW_COLUMNS", "BLOCK_ALL"])
      .optional()
      .describe("How Fivetran handles source schema changes"),
    schemas: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        "Nested schema/table/column config overrides matching Fivetran schema API",
      ),
  }),
  execute: async (input) => {
    const body: Record<string, unknown> = {};
    if (input.schema_change_handling)
      body.schema_change_handling = input.schema_change_handling;
    if (input.schemas) body.schemas = input.schemas;

    return {
      action: "modify_schema_config",
      connector_id: input.connector_id,
      method: "PATCH",
      url: `/connectors/${input.connector_id}/schemas`,
      body,
      warning: `This will modify schema config for connector ${input.connector_id}`,
    };
  },
});

const triggerSync = new LongRunningFunctionTool({
  name: "trigger_sync",
  description:
    "Trigger an immediate sync for a connector. Connector must be unpaused. Requires user confirmation",
  parameters: z.object({
    connector_id: z.string().describe("Fivetran connector ID"),
  }),
  execute: async (input) => {
    return {
      action: "trigger_sync",
      connector_id: input.connector_id,
      method: "POST",
      url: `/connectors/${input.connector_id}/sync`,
      body: { force: true },
      warning: `This will trigger an immediate sync for connector ${input.connector_id}`,
    };
  },
});

const resyncConnector = new LongRunningFunctionTool({
  name: "resync_connector",
  description:
    "Full historical re-sync — destructive, re-ingests all data. Use with caution. Requires user confirmation",
  parameters: z.object({
    connector_id: z.string().describe("Fivetran connector ID"),
    scope: z
      .enum(["full", "tables"])
      .optional()
      .describe("Resync scope: full connector or specific tables"),
    tables: z
      .record(z.string(), z.array(z.string()))
      .optional()
      .describe(
        'Tables to resync if scope is "tables", e.g. {"schema_name": ["table1", "table2"]}',
      ),
  }),
  execute: async (input) => {
    const isTableScope = input.scope === "tables" && input.tables;
    return {
      action: "resync_connector",
      connector_id: input.connector_id,
      method: "POST",
      url: isTableScope
        ? `/connectors/${input.connector_id}/schemas/tables/resync`
        : `/connectors/${input.connector_id}/resync`,
      body: isTableScope ? input.tables : {},
      warning: `⚠️ DESTRUCTIVE: This will re-ingest ${isTableScope ? "selected tables" : "ALL data"} for connector ${input.connector_id}`,
    };
  },
});

const openReauthDialog = new LongRunningFunctionTool({
  name: "open_reauth_dialog",
  description:
    "Open an in-app Fivetran Connect Card dialog so the user can re-authorize a broken connector without leaving the chat. Requires user confirmation",
  parameters: z.object({
    connector_id: z.string().describe("Fivetran connector ID"),
  }),
  execute: async (input) => {
    return {
      action: "Open Fivetran re-authorization dialog",
      connector_id: input.connector_id,
      toolName: "open_reauth_dialog",
    };
  },
});

export const writeTools = [
  modifyConnector,
  modifySchemaConfig,
  triggerSync,
  resyncConnector,
  openReauthDialog,
];
