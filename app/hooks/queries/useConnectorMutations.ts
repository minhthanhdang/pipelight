import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetchWithAuth";

export function useSyncAllConnectors() {
  return useMutation({
    mutationFn: () => fetchJson("/api/connectors/sync", { method: "POST" }),
  });
}
