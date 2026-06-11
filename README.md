## Inspiration

Every data team has lived the nightmare: a dashboard goes blank during a stakeholder meeting, and nobody knows why. The sync failed hours ago — or worse, it _succeeded_ but silently dropped columns due to a schema change upstream. Fivetran is excellent at moving data, but when things break, the debugging loop is brutal: jump between the Fivetran dashboard, check connector logs, cross-reference schema configs, dig into BigQuery to see what actually landed.

We asked ourselves: **what if an AI agent could do all of that automatically — detect the failure, diagnose the root cause, and walk the user through the fix in plain English?**

That question, combined with Google's Agent Development Kit (ADK) and the Fivetran REST API/MCP server, became Pipelight.

## What it does

Pipelight is a full-stack application that monitors Fivetran data pipelines in real-time and uses AI agents to detect, diagnose, and remediate sync failures — including the silent ones that don't trigger alerts.

**Automated audit pipeline:** When Fivetran completes a sync, a webhook fires into our app. We enrich the event with connector state, schema configs, column-level metadata, and recent sync history, then feed it to a specialized **Audit Agent** powered by Google Gemini. The agent returns a structured judgment — `clean`, `warning`, or `critical` — along with root cause analysis and actionable suggestions.

**Conversational remediation:** Users chat with an **Operations Agent** that has 13 Fivetran tools at its disposal — 8 read-only diagnostic tools and 5 action tools. Every action tool requires explicit user confirmation through interactive cards in the chat UI. The agent can walk a user through fixing a broken connector, unblocking silently excluded columns, or triggering a re-sync — all without leaving the conversation.

**Silent failure detection:** This is what we're most excited about. When `schema_change_handling` is set to `BLOCK_ALL` and a column gets renamed at the source, Fivetran reports a successful sync — but the new column is silently excluded. Old dashboards break with no alert. Our audit agent detects this by comparing column configs across consecutive syncs and flags it as a data quality incident.

**Dashboard & health scoring:** A pipeline health dashboard aggregates audit results across 7/30/90-day windows, surfaces incidents, and logs every AI action for full auditability.

## How we built it

**Three specialized Google ADK agents**, each with a distinct role:

1. **Operations Agent** — the user-facing conversational agent with full Fivetran tool access. User can select their favorite Gemini model with advanced configurable thinking options. Uses Google ADK's function-calling protocol for tool execution.
2. **Audit Agent** — triggered automatically by webhooks, receives enriched sync snapshots and returns structured JSON judgments. Runs headlessly with no user interaction.
3. **Summary Agent** — generates periodic health reports by aggregating metrics across connectors and time periods.

**Google Cloud stack throughout:**

- **Cloud SQL (PostgreSQL)** our database choice
- **Google Cloud Agent Builder** inspects the agents
- **BigQuery** serves as the Fivetran destination warehouse (`glade_several`, `GCP_US_EAST4`)
- **Google Cloud Storage** stores demonstration data as a Fivetran connector
- **Google Sheets** holds demonstration data as a Fivetran connector
- **Google ADK** powers all three AI agents with Gemini model access
- **Cloud Run** hosts our powerful agents.

**Web application** built with Next.js. The chat system uses Server-Sent Events (SSE) to stream agent responses in real-time, parsing Gemini's streaming output incrementally in the browser.

**Fivetran integration** uses the REST API v1 with Basic Auth. We encrypt API credentials with AES-256-GCM per user for multi-tenant isolation. Webhooks are validated with HMAC-SHA256 timing-safe comparison. We also integrated the **Fivetran Connect Card** for seamless re-authorization — when the agent detects a broken connector needing re-auth, it launches an iframe-based OAuth flow directly within the chat.

**Fivetran MCP** provided additional development-time access to Fivetran operations, letting us rapidly prototype tool definitions and test API interactions before hardcoding them into the agent.

## Challenges we ran into

**Fivetran API Discovery: Fivetran's `rowsSynced` is actually bytes, not rows.** The API returns `extract.volume` labeled in a way that strongly suggests row counts. We spent hours debugging why our "row count" metrics were in the millions for tiny tables before realizing it's extract volume in bytes. The audit agent now correctly interprets and formats this as KB/MB/GB.

**Silent failures are genuinely silent.** With `BLOCK_ALL` schema change handling, Fivetran reports `sync_state: "success"` even when new columns are being excluded. There's no warning, no error, no task. The only signal is in the schema config itself — you have to diff column-level configs across consecutive syncs to detect drift. Building reliable detection for this required fetching and storing full column configs per table per sync, which significantly increased the complexity of our audit pipeline.

**Streaming ADK responses with tool calls.** Google ADK streams responses as SSE events, but tool calls can appear mid-stream and need to be intercepted before the agent continues. We had to build a custom SSE parser that detects tool calls in real-time, pauses the stream, renders a confirmation card, waits for user input, sends the function response back to ADK, and resumes streaming — all without losing context.

**Connect Card iframe flow.** Re-authenticating a broken Fivetran connector requires the Connect Card OAuth flow, which opens in an iframe with a redirect callback. Coordinating this between the agent's tool call, the frontend iframe, the OAuth callback page, and the resumed agent session was one of the trickiest integration challenges.

## Accomplishments that we're proud of

- **Detecting failures Fivetran itself doesn't alert on.** Silent schema drift with `BLOCK_ALL` is a real production problem, and our system catches it automatically on every sync.
- **End-to-end remediation without context switching.** A user can go from "something's wrong" to a fully fixed and re-syncing connector without ever leaving the chat interface.
- **Confirmable write operations.** Every destructive or state-changing action requires explicit user approval through rich, informative confirmation cards — not just a "yes/no" prompt, but cards showing exactly what will change.
- **Webhook-triggered AI audits running autonomously.** The system doesn't wait for a human to notice a problem. Every sync completion is automatically analyzed, and incidents surface proactively.
- **Production-grade security.** AES-256-GCM encrypted credentials, HMAC-SHA256 webhook validation, per-user isolation, parameterized queries, and a full AI action audit log.

## What we learned

- **Google ADK makes multi-agent architectures practical.** Having three agents with distinct system prompts, tool access, and output schemas — all sharing the same Gemini backend — let us decompose the problem cleanly. The audit agent doesn't need chat tools; the operations agent doesn't need to run headlessly.
- **Gemini's thinking budgets are powerful for diagnostics.** Setting `thinkingConfig` to HIGH (24K tokens) on complex schema drift cases gave the agent room to reason through column comparisons and produce accurate root cause analysis. On simple status checks, MINIMAL keeps responses fast.
- **The Fivetran API is more capable than the dashboard suggests.** Column-level schema config, setup test endpoints, and state/cursor inspection gave us diagnostic depth that isn't easily accessible through the Fivetran UI itself.
- **Schema change handling policy is a critical design decision** that most teams set once and forget. `BLOCK_ALL` feels safe but creates silent data loss. `ALLOW_ALL` feels risky but at least surfaces changes. There's no perfect default — which is exactly why an AI auditor adds value.

## What's next for Pipelight

- **Auto-remediation mode** — for known-safe fixes (like unblocking a renamed column with clear mapping), let the agent execute without confirmation, with full audit logging.
- **BigQuery data quality validation** — after a sync completes, query the destination to verify row counts, NULL rates, and freshness against expected baselines.
- **Multi-destination support** — extend beyond BigQuery to Snowflake, Databricks, and Redshift destinations.
- **Slack/Teams integration** — push audit findings to team channels with one-click remediation links that open the chat agent.
- **Historical pattern learning** — use past audit data to predict which connectors are likely to fail and pre-emptively surface recommendations.
- **Vertex AI integration** — move agent hosting to Vertex AI Agent Engine for managed scaling, monitoring, and A/B testing of agent configurations.
