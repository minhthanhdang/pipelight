import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchWithAuth, ApiError } from "@/lib/fetchWithAuth";
import { queryKeys } from "./queryKeys";

interface FivetranSettings {
  hasKeys: boolean;
  maskedApiKey?: string | null;
}

interface SaveKeysPayload {
  apiKey: string;
  apiSecret: string;
}

interface ConnectorSyncSummary {
  upserted?: number;
  deleted?: number;
  failed?: number;
  errors?: string[];
  backfilledConnectors?: number;
  backfilledEvents?: number;
  error?: string;
}

interface SaveKeysResponse {
  maskedApiKey?: string | null;
  connectorSync?: ConnectorSyncSummary;
}

export function useFivetranSettings() {
  return useQuery({
    queryKey: queryKeys.settings.fivetran(),
    queryFn: () => fetchJson<FivetranSettings>("/api/settings/fivetran"),
  });
}

export function useSaveFivetranKeys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveKeysPayload) =>
      fetchJson<SaveKeysResponse>("/api/settings/fivetran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.fivetran() });
    },
  });
}

export function useRemoveFivetranKeys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/settings/fivetran", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body.error ?? "Failed to remove");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.fivetran() });
    },
  });
}
