"use client";

import { AgentSettingsPanel } from "@/components/agent/AgentSettingsPanel";

export default function AgentPage() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent</h1>
        <p className="mt-2 text-muted-foreground">AI agent for detecting and fixing sync failures.</p>
      </div>
      <AgentSettingsPanel />
    </div>
  );
}
