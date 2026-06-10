export const MODELS = [
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type ModelCapabilities = {
  temperature: boolean;
  topP: boolean;
  thinkingLevel: boolean;
  customInstruction: boolean;
};

export const MODEL_CAPABILITIES: Record<ModelId, ModelCapabilities> = {
  "gemini-3.5-flash": { temperature: true, topP: true, thinkingLevel: true, customInstruction: true },
  "gemini-3.1-pro-preview": { temperature: true, topP: true, thinkingLevel: true, customInstruction: true },
  "gemini-2.5-flash": { temperature: true, topP: true, thinkingLevel: true, customInstruction: true },
  "gemini-2.5-pro": { temperature: true, topP: true, thinkingLevel: true, customInstruction: true },
  "gemini-2.0-flash": { temperature: true, topP: true, thinkingLevel: false, customInstruction: true },
};

export type ThinkingLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";

export type AgentConfig = {
  model: ModelId;
  temperature?: number;
  topP?: number;
  thinkingLevel?: ThinkingLevel;
  customInstruction?: string;
};

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  model: "gemini-2.5-flash",
  temperature: 1.0,
  topP: 0.95,
  thinkingLevel: "MEDIUM",
  customInstruction: "",
};
