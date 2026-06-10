import { FunctionTool, type Context } from "@google/adk";
import { z } from "zod";
import { appFetch } from "../lib/app-api.js";

function wrapExecute<T>(fn: (args: T, context?: Context) => Promise<unknown>) {
  return async (args: T, context?: Context) => {
    try {
      return await fn(args, context);
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  };
}

const getSyncEvents = new FunctionTool({
  name: "get_sync_events",
  description:
    "Get recent sync events from the database. Filter by connector, status, or audit status. Returns events with their latest audit judgement.",
  parameters: z.object({
    connector_id: z.string().optional().describe("Filter by internal connector ID"),
    fivetran_id: z.string().optional().describe("Filter by Fivetran connector ID"),
    status: z.string().optional().describe("Filter by sync status (e.g. 'SUCCESSFUL', 'FAILURE_WITH_TASK')"),
    audit_status: z.string().optional().describe("Filter by audit status ('pending' or 'audited')"),
    limit: z.number().optional().describe("Max results (default 10, max 50)"),
  }),
  execute: wrapExecute(
    async (
      args: {
        connector_id?: string;
        fivetran_id?: string;
        status?: string;
        audit_status?: string;
        limit?: number;
      },
      context?: Context,
    ) => {
      return appFetch(
        "/api/agent/sync-events",
        {
          connectorId: args.connector_id,
          fivetranId: args.fivetran_id,
          status: args.status,
          auditStatus: args.audit_status,
          limit: args.limit?.toString(),
        },
        context,
      );
    },
  ),
});

const getSyncAudits = new FunctionTool({
  name: "get_sync_audits",
  description:
    "Get audit results for sync events. Each audit contains a judgement (clean/warning/failure), root cause analysis, and suggested actions. Requires syncEventId or fivetranId.",
  parameters: z.object({
    sync_event_id: z.string().optional().describe("Filter by specific sync event ID"),
    fivetran_id: z.string().optional().describe("Filter by Fivetran connector ID to get all audits for that connector"),
    judgement: z.string().optional().describe("Filter by judgement ('clean', 'warning', 'failure')"),
    limit: z.number().optional().describe("Max results (default 10, max 50)"),
  }),
  execute: wrapExecute(
    async (
      args: {
        sync_event_id?: string;
        fivetran_id?: string;
        judgement?: string;
        limit?: number;
      },
      context?: Context,
    ) => {
      return appFetch(
        "/api/agent/audits",
        {
          syncEventId: args.sync_event_id,
          fivetranId: args.fivetran_id,
          judgement: args.judgement,
          limit: args.limit?.toString(),
        },
        context,
      );
    },
  ),
});

const getSyncSummaries = new FunctionTool({
  name: "get_sync_summaries",
  description:
    "Get aggregated sync summaries for a connector or all connectors. Summaries contain health verdicts, sync stats, and failure pattern analysis for a time period.",
  parameters: z.object({
    connector_id: z.string().optional().describe("Filter by internal connector ID"),
    fivetran_id: z.string().optional().describe("Filter by Fivetran connector ID"),
    period_label: z.string().optional().describe("Filter by period label (e.g. 'last_24h', 'last_7d')"),
    limit: z.number().optional().describe("Max results (default 5, max 20)"),
  }),
  execute: wrapExecute(
    async (
      args: {
        connector_id?: string;
        fivetran_id?: string;
        period_label?: string;
        limit?: number;
      },
      context?: Context,
    ) => {
      return appFetch(
        "/api/agent/summaries",
        {
          connectorId: args.connector_id,
          fivetranId: args.fivetran_id,
          periodLabel: args.period_label,
          limit: args.limit?.toString(),
        },
        context,
      );
    },
  ),
});

export const dbReadTools = [
  getSyncEvents,
  getSyncAudits,
  getSyncSummaries,
];
