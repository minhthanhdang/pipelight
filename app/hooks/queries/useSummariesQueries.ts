import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetchWithAuth";
import { queryKeys } from "./queryKeys";
import type { SyncSummaryItem } from "@/lib/dashboard-types";

interface SummariesResponse {
  summaries: SyncSummaryItem[];
}

interface GenerateSummaryPayload {
  connectorId?: string;
  period: string;
}

export function useSummaries(connectorId?: string) {
  return useQuery({
    queryKey: queryKeys.summaries.list(connectorId),
    queryFn: () => {
      const params = new URLSearchParams();
      if (connectorId) params.set("connectorId", connectorId);
      return fetchJson<SummariesResponse>(`/api/summaries?${params}`);
    },
  });
}

export function useGenerateSummary(connectorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateSummaryPayload) =>
      fetchJson<SyncSummaryItem>("/api/summaries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.summaries.list(connectorId) });
    },
  });
}
