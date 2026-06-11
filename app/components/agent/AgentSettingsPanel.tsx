"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAgentSettingsStore } from "@/stores/useAgentSettingsStore";
import { useAgentConfig, useUpdateAgentConfig } from "@/hooks/queries";
import {
  MODELS,
  MODEL_CAPABILITIES,
  type ModelId,
  type ThinkingLevel,
} from "@/lib/agent-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const THINKING_LEVELS: ThinkingLevel[] = ["MINIMAL", "LOW", "MEDIUM", "HIGH"];

export function AgentSettingsPanel() {
  const store = useAgentSettingsStore();
  const caps = MODEL_CAPABILITIES[store.model as ModelId] ?? MODEL_CAPABILITIES["gemini-2.5-flash"];

  const { data: serverConfig } = useAgentConfig();
  const updateMutation = useUpdateAgentConfig();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (serverConfig && !store.isLoaded) {
      store.setFromServer(serverConfig);
    }
  }, [serverConfig, store.isLoaded]);

  const debouncedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const config = useAgentSettingsStore.getState().getConfig();
      updateMutation.mutate(config);
    }, 500);
  }, [updateMutation]);

  const handleUpdate = useCallback(
    (partial: Parameters<typeof store.updateConfig>[0]) => {
      store.updateConfig(partial);
      debouncedSave();
    },
    [store, debouncedSave],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Settings</CardTitle>
        <CardDescription>Configure the Gemini model powering the chat and audit agents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={store.model}
            onValueChange={(v) => handleUpdate({ model: v as ModelId })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={!caps.temperature ? "text-muted-foreground" : ""}>
            Temperature: {store.temperature?.toFixed(1) ?? "1.0"}
          </Label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={store.temperature ?? 1.0}
            disabled={!caps.temperature}
            onChange={(e) => handleUpdate({ temperature: parseFloat(e.target.value) })}
            className="w-full accent-primary disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>2</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className={!caps.topP ? "text-muted-foreground" : ""}>
            Top-P: {store.topP?.toFixed(2) ?? "0.95"}
          </Label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={store.topP ?? 0.95}
            disabled={!caps.topP}
            onChange={(e) => handleUpdate({ topP: parseFloat(e.target.value) })}
            className="w-full accent-primary disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>1</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className={!caps.thinkingLevel ? "text-muted-foreground" : ""}>Thinking Level</Label>
          <Select
            value={store.thinkingLevel ?? "MEDIUM"}
            onValueChange={(v) => handleUpdate({ thinkingLevel: v as ThinkingLevel })}
            disabled={!caps.thinkingLevel}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THINKING_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={!caps.customInstruction ? "text-muted-foreground" : ""}>
            Custom Instruction
          </Label>
          <textarea
            value={store.customInstruction ?? ""}
            disabled={!caps.customInstruction}
            onChange={(e) => handleUpdate({ customInstruction: e.target.value })}
            placeholder="Additional instructions appended to the agent's system prompt..."
            rows={4}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
        </div>
      </CardContent>
    </Card>
  );
}
