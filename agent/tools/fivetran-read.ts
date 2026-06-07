import { FunctionTool, type Context } from "@google/adk";
import { z } from "zod";
import { fivetranFetch, GROUP_ID, type FivetranCreds } from "../lib/fivetran-api.js";

function getCredsFromContext(context?: Context): FivetranCreds | undefined {
  if (!context) return undefined;
  const apiKey = context.state.get("fivetran_api_key") as string | undefined;
  const secretKey = context.state.get("fivetran_secret_key") as string | undefined;
  if (apiKey && secretKey) return { apiKey, secretKey };
  return undefined;
}

const connectorIdParam = z.object({
  connector_id: z.string().describe("Fivetran connector ID"),
});

function parseConnectorSummary(c: any) {
  return {
    id: c.id,
    service: c.service,
    paused: c.paused,
    sync_frequency: c.sync_frequency,
    setup_state: c.status?.setup_state,
    sync_state: c.status?.sync_state,
    succeeded_at: c.succeeded_at,
    failed_at: c.failed_at,
  };
}

function parseConnectorDetails(c: any) {
  return {
    id: c.id,
    service: c.service,
    paused: c.paused,
    sync_frequency: c.sync_frequency,
    schema_change_handling: c.schema_change_handling,
    setup_state: c.status?.setup_state,
    sync_state: c.status?.sync_state,
    succeeded_at: c.succeeded_at,
    failed_at: c.failed_at,
  };
}

function parseSchema(data: any) {
  return {
    schema_change_handling: data.schema_change_handling,
    schemas: Object.entries(data.schemas ?? {}).map(
      ([name, schema]: [string, any]) => ({
        name,
        enabled: schema.enabled,
        tables: Object.entries(schema.tables ?? {}).map(
          ([tName, table]: [string, any]) => ({
            name: tName,
            enabled: table.enabled,
            columns: Object.entries(table.columns ?? {}).map(
              ([cName, col]: [string, any]) => ({
                name: cName,
                enabled: col.enabled,
              })
            ),
          })
        ),
      })
    ),
  };
}

function parseSetupTests(data: any) {
  const tests: { title: string; status: string; message: string }[] =
    data.setup_tests ?? [];
  const failed = tests.some((t) => t.status !== "PASSED");
  return {
    status: failed ? "failed" : "passed",
    tests,
  };
}

function wrapExecute<T>(fn: (args: T, context?: Context) => Promise<any>) {
  return async (args: T, context?: Context) => {
    try {
      return await fn(args, context);
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  };
}

const listConnectors = new FunctionTool({
  name: "list_connectors",
  description:
    "List all connectors in the group with their sync status, setup state, and schedule",
  execute: wrapExecute(async (_args: unknown, context?: Context) => {
    const creds = getCredsFromContext(context);
    const data = (await fivetranFetch(`/groups/${GROUP_ID}/connectors`, {}, creds)) as any;
    return { items: (data.items ?? []).map(parseConnectorSummary) };
  }),
});

const getConnectorDetails = new FunctionTool({
  name: "get_connector_details",
  description:
    "Get detailed connector status including sync state, setup state, schedule, and config",
  parameters: connectorIdParam,
  execute: wrapExecute(async ({ connector_id }: { connector_id: string }, context?: Context) => {
    const creds = getCredsFromContext(context);
    const data = (await fivetranFetch(`/connectors/${connector_id}`, {}, creds)) as any;
    return parseConnectorDetails(data);
  }),
});

const getConnectorSchema = new FunctionTool({
  name: "get_connector_schema",
  description:
    "Get schema config — schemas, tables, columns, and their enabled states. Use to detect schema drift or blocked columns",
  parameters: connectorIdParam,
  execute: wrapExecute(async ({ connector_id }: { connector_id: string }, context?: Context) => {
    const creds = getCredsFromContext(context);
    const data = (await fivetranFetch(`/connectors/${connector_id}/schemas`, {}, creds)) as any;
    return parseSchema(data);
  }),
});

const getConnectorState = new FunctionTool({
  name: "get_connector_state",
  description:
    "Get internal sync cursor and replication markers for a connector",
  parameters: connectorIdParam,
  execute: wrapExecute(async ({ connector_id }: { connector_id: string }, context?: Context) => {
    const creds = getCredsFromContext(context);
    return fivetranFetch(`/connectors/${connector_id}/state`, {}, creds);
  }),
});

const testConnectorSetup = new FunctionTool({
  name: "test_connector_setup",
  description:
    "Run setup tests — checks connectivity, auth, and permissions for the connector",
  parameters: connectorIdParam,
  execute: wrapExecute(async ({ connector_id }: { connector_id: string }, context?: Context) => {
    const creds = getCredsFromContext(context);
    const data = (await fivetranFetch(`/connectors/${connector_id}/test`, { method: "POST" }, creds)) as any;
    return parseSetupTests(data);
  }),
});

const reloadSchema = new FunctionTool({
  name: "reload_schema",
  description:
    "Force Fivetran to re-read the source schema. Non-destructive. Use to detect schema drift",
  parameters: connectorIdParam,
  execute: wrapExecute(async ({ connector_id }: { connector_id: string }, context?: Context) => {
    const creds = getCredsFromContext(context);
    const data = (await fivetranFetch(`/connectors/${connector_id}/schemas/reload`, { method: "POST" }, creds)) as any;
    return parseSchema(data);
  }),
});

export const readTools = [
  listConnectors,
  getConnectorDetails,
  getConnectorSchema,
  getConnectorState,
  testConnectorSetup,
  reloadSchema,
];
