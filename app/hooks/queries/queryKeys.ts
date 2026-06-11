export const queryKeys = {
  dashboard: {
    health: (period: string) => ["dashboard", "health", period] as const,
    incidents: (period: string) => ["dashboard", "incidents", period] as const,
    syncs: (period: string) => ["dashboard", "syncs", period] as const,
    healthyConnectors: (period: string) => ["dashboard", "healthy-connectors", period] as const,
    issues: () => ["dashboard", "issues"] as const,
    actions: () => ["dashboard", "actions"] as const,
  },
  syncHistory: {
    events: (connectorId: string) => ["sync-events", connectorId] as const,
    auditDistribution: (start: string, end: string, connectorId?: string) =>
      ["audit-distribution", start, end, connectorId] as const,
    eventAudits: (eventId: string) => ["event-audits", eventId] as const,
    falsePositives: (connectorId: string, start: string, end: string) =>
      ["false-positives", connectorId, start, end] as const,
  },
  settings: {
    fivetran: () => ["settings", "fivetran"] as const,
  },
  summaries: {
    list: (connectorId?: string) => ["summaries", connectorId ?? "all"] as const,
  },
  agentConfig: {
    current: () => ["agent-config"] as const,
  },
};
