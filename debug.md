# Debug Notes

## Gemini API — Thinking Config

`thinkingLevel` field (enum: MINIMAL/LOW/MEDIUM/HIGH) is NOT supported by `gemini-2.5-flash` via the Gemini API backend. Use `thinkingBudget` (integer token count) instead.

Mapping used:
- MINIMAL → 128
- LOW → 1024
- MEDIUM → 8192
- HIGH → 24576

Files affected: `agent/agent.ts`, `agent/audit-agent.ts`

Error when using `thinkingLevel`: `"Thinking level is not supported for this model."`
