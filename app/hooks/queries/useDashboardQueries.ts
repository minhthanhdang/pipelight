import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetchWithAuth";
import { queryKeys } from "./queryKeys";
import type {
  HealthResponse,
  IncidentsResponse,
  SyncStatsResponse,
  HealthyConnectorsResponse,
  AuditIssueItem,
  ActionsResponse,
} from "@/lib/dashboard-types";

export function useDashboardHealth(period: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.health(period),
    queryFn: () => fetchJson<HealthResponse>(`/api/dashboard/health?period=${period}`),
  });
}

export function useDashboardIncidents(period: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.incidents(period),
    queryFn: () => fetchJson<IncidentsResponse>(`/api/dashboard/incidents?period=${period}`),
  });
}

export function useDashboardSyncs(period: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.syncs(period),
    queryFn: () => fetchJson<SyncStatsResponse>(`/api/dashboard/syncs?period=${period}`),
  });
}

export function useDashboardHealthyConnectors(period: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.healthyConnectors(period),
    queryFn: () => fetchJson<HealthyConnectorsResponse>(`/api/dashboard/healthy-connectors?period=${period}`),
  });
}

export function useDashboardIssues() {
  return useQuery({
    queryKey: queryKeys.dashboard.issues(),
    queryFn: () => fetchJson<AuditIssueItem[]>(`/api/dashboard/issues`),
  });
}

export function useDashboardActions() {
  return useInfiniteQuery({
    queryKey: queryKeys.dashboard.actions(),
    queryFn: ({ pageParam }) => {
      const params = pageParam ? `?cursor=${pageParam}` : "";
      return fetchJson<ActionsResponse>(`/api/dashboard/actions${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
