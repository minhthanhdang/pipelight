import { create } from "zustand";
import {
  type AgentConfig,
  type ModelId,
  MODEL_CAPABILITIES,
  DEFAULT_AGENT_CONFIG,
} from "@/lib/agent-config";

type AgentSettingsState = AgentConfig & {
  isLoaded: boolean;
  setFromServer: (config: AgentConfig) => void;
  updateConfig: (partial: Partial<AgentConfig>) => void;
  getConfig: () => AgentConfig;
};

export const useAgentSettingsStore = create<AgentSettingsState>((set, get) => ({
  ...DEFAULT_AGENT_CONFIG,
  isLoaded: false,

  setFromServer: (config) => {
    set({ ...config, isLoaded: true });
  },

  updateConfig: (partial) => {
    set(partial);
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
