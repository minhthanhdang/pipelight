export interface HealthIncidentItem {
  id: string;
  fivetranId: string;
  kind: "sync_failure" | "audit_failure";
  label: string;
  timestamp: string;
}

export interface HealthResponse {
  score: number;
  syncFailureCount: number;
  auditWarningCount: number;
  auditCriticalCount: number;
  recentIncidents: HealthIncidentItem[];
}

export interface SyncStatsResponse {
  total: number;
  successes: number;
  failures: number;
  daily: { date: string; success: number; failure: number }[];
  topFailures: { fivetranId: string; service: string; failureCount: number }[];
}

export interface AuditIssueItem {
  id: string;
  syncEventId: string;
  fivetranId: string;
  judgement: string;
  directCause: string;
  analysis: string;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  connectorId: string | null;
  fivetranId: string | null;
  action: string;
  toolName: string;
  approved: boolean;
  createdAt: string;
}

export interface ActionsResponse {
  actions: ActionItem[];
  nextCursor: string | null;
}

export interface SyncEventItem {
  id: string;
  connectorId: string;
  fivetranId: string;
  status: string;
  auditStatus: string;
  startedAt: string;
  completedAt: string | null;
  rowsSynced: number | null;
  syncType: string | null;
  syncMetrics: Record<string, unknown> | null;
  errorMessage: string | null;
  connectorService: string;
  audit?: SyncAuditResult;
  auditCount?: number;
  snapshotData?: Record<string, unknown> | null;
}

export interface SyncHistoryResponse {
  events: SyncEventItem[];
  nextCursor: string | null;
}

export interface ConnectorOption {
  id: string;
  service: string;
  fivetranId: string;
  paused: boolean;
  setupState: string;
  syncState: string;
  succeededAt: string | null;
  failedAt: string | null;
  label: string;
  sourceType: string;
  schemaPrefix?: string | null;
}

export interface AuditDistribution {
  clean: number;
  warning: number;
  critical: number;
  total: number;
}
export interface AuditDistributionResponse {
  distribution: AuditDistribution;
}

export interface AuditSuggestion {
  action: string;
  toolName: string;
  params: Record<string, unknown>;
}

export interface SyncAuditResult {
  id: string;
  judgement: string;
  directCause: string;
  analysis: string;
  suggestions: AuditSuggestion[];
  createdAt: string;
}

export interface SyncSummaryItem {
  id: string;
  connectorId: string | null;
  fivetranId: string | null;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  summary: string;
  stats: Record<string, unknown> | null;
  createdAt: string;
}

export interface SyncSummariesResponse {
  summaries: SyncSummaryItem[];
  nextCursor: string | null;
}

export interface IncidentsByConnector {
  fivetranId: string;
  service: string;
  syncFailures: number;
  auditCriticals: number;
}

export interface IncidentsResponse {
  connectors: IncidentsByConnector[];
}

export interface HealthyConnectorItem {
  fivetranId: string;
  service: string;
  lastSyncedAt: string | null;
}

export interface HealthyConnectorsResponse {
  connectors: HealthyConnectorItem[];
}
