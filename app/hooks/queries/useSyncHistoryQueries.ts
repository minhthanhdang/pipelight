import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchWithAuth, ApiError } from "@/lib/fetchWithAuth";
import { queryKeys } from "./queryKeys";
import type { AuditDistributionResponse, FalsePositiveResponse, SyncAuditResult, SyncHistoryResponse } from "@/lib/dashboard-types";

export function useAuditDistribution(params: { start?: string; end?: string; connectorId?: string } | null) {
  return useQuery({
    queryKey: params ? queryKeys.syncHistory.auditDistribution(params.start ?? "all", params.end ?? "all", params.connectorId) : ["audit-distribution-disabled"],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params!.start) sp.set("start", params!.start);
      if (params!.end) sp.set("end", params!.end);
      if (params!.connectorId) sp.set("connectorId", params!.connectorId);
      return fetchJson<AuditDistributionResponse>(`/api/sync-history/audits?${sp}`);
    },
    enabled: !!params,
  });
}

export function useFalsePositiveStats(params: { connectorId: string; start?: string; end?: string } | null) {
  return useQuery({
    queryKey: params ? queryKeys.syncHistory.falsePositives(params.connectorId, params.start ?? "all", params.end ?? "all") : ["false-positives-disabled"],
    queryFn: () => {
      const sp = new URLSearchParams({ connectorId: params!.connectorId });
      if (params!.start) sp.set("start", params!.start);
      if (params!.end) sp.set("end", params!.end);
      return fetchJson<FalsePositiveResponse>(`/api/sync-history/false-positives?${sp}`);
    },
    enabled: !!params,
  });
}

export function useEventAudits(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.syncHistory.eventAudits(eventId ?? ""),
    queryFn: () => fetchJson<SyncAuditResult[]>(`/api/sync-history/${eventId}/audits`),
    enabled: !!eventId,
  });
}

export function useSyncEvents(connectorId: string, hasRunning: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.syncHistory.events(connectorId),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ connectorId });
      if (pageParam) params.set("cursor", pageParam);
      return fetchJson<SyncHistoryResponse>(`/api/sync-history?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: hasRunning ? 5000 : false,
  });
}

export function useTriggerSync(connectorFivetranId: string, connectorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/connectors/${connectorFivetranId}/sync`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.syncHistory.events(connectorId) });
    },
  });
}

export function useTriggerAudit(connectorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      fetchJson(`/api/sync-history/${eventId}/audit`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.syncHistory.events(connectorId) });
    },
  });
}
