export interface HealthResponse {
  score: number;
  incidentCount: number;
  warningCount: number;
  byType: Record<string, number>;
  recentIncidents: {
    id: string;
    type: string;
    severity: string;
    title: string;
    detectedAt: string;
  }[];
}

export interface SyncStatsResponse {
  total: number;
  successes: number;
  failures: number;
  daily: { date: string; success: number; failure: number }[];
  topFailures: { fivetranId: string; service: string; failureCount: number }[];
}

export interface IssueItem {
  id: string;
  connectorId: string | null;
  fivetranId: string | null;
  type: string;
  severity: string;
  title: string;
  description: string;
  detectedAt: string;
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
  startedAt: string;
  completedAt: string | null;
  rowsSynced: number | null;
  errorMessage: string | null;
  connectorService: string;
}

export interface SyncHistoryResponse {
  events: SyncEventItem[];
  nextCursor: string | null;
}
