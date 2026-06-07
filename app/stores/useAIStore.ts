import { create } from "zustand";

type AIState = {
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  pendingPrompt: string | null;
  setPendingPrompt: (v: string | null) => void;
};

export const useAIStore = create<AIState>((set) => ({
  isStreaming: false,
  setIsStreaming: (v) => set({ isStreaming: v }),
  chatOpen: false,
  setChatOpen: (v) => set({ chatOpen: v }),
  pendingPrompt: null,
  setPendingPrompt: (v) => set({ pendingPrompt: v }),
}));
