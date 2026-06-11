import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetchWithAuth";
import { queryKeys } from "./queryKeys";
import type { AgentConfig } from "@/lib/agent-config";

export function useAgentConfig() {
  return useQuery({
    queryKey: queryKeys.agentConfig.current(),
    queryFn: () => fetchJson<AgentConfig>("/api/agent-config"),
  });
}

export function useUpdateAgentConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: AgentConfig) =>
      fetchJson("/api/agent-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.agentConfig.current() });
    },
  });
}
