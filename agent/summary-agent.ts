import { LlmAgent } from "@google/adk";
import { readTools } from "./tools/fivetran-read.js";
import type { AgentConfig } from "./agent.js";

const BASE_INSTRUCTION = `You are a Fivetran sync summary analyst. You receive aggregated sync statistics and produce a concise markdown summary.

## Input Format
You receive a JSON object with:
- period: { start, end, label }
- connectorId / fivetranId (null = all connectors)
- stats: aggregated metrics including success/failure counts, total extract volume (bytes), per-connector breakdowns, audit judgement distribution, top errors, and syncMetrics

## Data Volume
The "volume" and "totalVolume" fields are **extract volume in bytes** from Fivetran's sync-history API (stages.extract.volume). This is not a row count — it measures the raw data extracted from the source. Format it as human-readable sizes (KB/MB/GB) in your output.

## Output Format
Return raw markdown (no JSON, no code fences) covering:

### Overall Health
A 1-2 sentence verdict on sync health for the period.

### Sync Activity
- Total syncs, success rate, failure rate
- Total data volume synced (formatted as KB/MB/GB)
- Sync type breakdown (incremental vs historical)

### Per-Connector Breakdown
For each connector: success/failure counts, data volume extracted, notable patterns.

### Failure Patterns
Top errors, recurring failures, connectors with declining health.

### Data Volume Trends
Extract volume trends per connector, volume anomalies (e.g. 0 bytes on an incremental sync may be normal if no data changed, but 0 bytes on a historical sync indicates a problem).

### Audit Findings
Distribution of audit judgements (clean/warning/failure), top direct causes.

### Recommendations
Actionable next steps based on the data. Be specific — reference connector IDs and failure types.

## Rules
- Be data-driven: cite numbers from the stats
- If data is sparse (few syncs), say so rather than over-interpreting
- Keep sections concise — skip sections with no relevant data
- Use bullet points and tables where appropriate`;

export function createSummaryAgent(config: AgentConfig = {}) {
  const instruction = config.customInstruction
    ? `${BASE_INSTRUCTION}\n\n## Additional Instructions\n${config.customInstruction}`
    : BASE_INSTRUCTION;

  const generateContentConfig: Record<string, unknown> = {};
  if (config.temperature !== undefined) generateContentConfig.temperature = config.temperature;
  if (config.topP !== undefined) generateContentConfig.topP = config.topP;
  const model = config.model ?? "gemini-2.5-flash";
  if (config.thinkingLevel && model.includes("2.5")) {
    const budgetMap: Record<string, number> = { MINIMAL: 128, LOW: 1024, MEDIUM: 8192, HIGH: 24576 };
    generateContentConfig.thinkingConfig = { thinkingBudget: budgetMap[config.thinkingLevel] ?? 8192 };
  }

  return new LlmAgent({
    name: "sync_summary_agent",
    model: config.model ?? "gemini-2.5-flash",
    tools: [...readTools],
    instruction,
    ...(Object.keys(generateContentConfig).length > 0 && { generateContentConfig }),
  });
}

export const rootAgent = createSummaryAgent();
