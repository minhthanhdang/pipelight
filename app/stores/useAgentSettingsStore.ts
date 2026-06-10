import { create } from "zustand";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  type AgentConfig,
  type ModelId,
  MODEL_CAPABILITIES,
  DEFAULT_AGENT_CONFIG,
} from "@/lib/agent-config";

type AgentSettingsState = AgentConfig & {
  isLoaded: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (partial: Partial<AgentConfig>) => void;
  getConfig: () => AgentConfig;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function persistConfig(config: AgentConfig) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await fetchWithAuth("/api/agent-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  }, 500);
}

export const useAgentSettingsStore = create<AgentSettingsState>((set, get) => ({
  ...DEFAULT_AGENT_CONFIG,
  isLoaded: false,

  fetchConfig: async () => {
    const res = await fetchWithAuth("/api/agent-config");
    if (res.ok) {
      const data: AgentConfig = await res.json();
      set({ ...data, isLoaded: true });
    }
  },

  updateConfig: (partial) => {
    set(partial);
    const state = get();
    const config: AgentConfig = {
      model: state.model,
      temperature: state.temperature,
      topP: state.topP,
      thinkingLevel: state.thinkingLevel,
      customInstruction: state.customInstruction,
    };
    persistConfig(config);
  },

  getConfig: () => {
    const state = get();
    const caps = MODEL_CAPABILITIES[state.model as ModelId];
    return {
      model: state.model,
      temperature: caps?.temperature ? state.temperature : undefined,
      topP: caps?.topP ? state.topP : undefined,
      thinkingLevel: caps?.thinkingLevel ? state.thinkingLevel : undefined,
      customInstruction: caps?.customInstruction ? state.customInstruction : undefined,
    };
  },
}));
