import "dotenv/config";
import express from "express";
import cors from "cors";
import { InMemoryRunner } from "@google/adk";
import { createAgent, type AgentConfig } from "./agent.js";
import { createAuditAgent } from "./audit-agent.js";
import { createSummaryAgent } from "./summary-agent.js";

const app = express();
app.use(cors());
app.use(express.json());

const sessionConfigs = new Map<string, AgentConfig>();
const runners = new Map<string, InMemoryRunner>();

function getOrCreateRunner(appName: string, config: AgentConfig): InMemoryRunner {
  const key = JSON.stringify({ appName, config });
  let runner = runners.get(key);
  if (!runner) {
    const agent = appName === "sync_audit"
      ? createAuditAgent(config)
      : appName === "sync_summary"
      ? createSummaryAgent(config)
      : createAgent(config);
    runner = new InMemoryRunner({ agent, appName });
    runners.set(key, runner);
  }
  return runner;
}

app.post("/apps/:appName/users/:userId/sessions", async (req, res) => {
  const { appName } = req.params;
  const { userId } = req.params;
  const { state } = req.body ?? {};

  const config: AgentConfig = state?.agentConfig ?? {};
  const runner = getOrCreateRunner(appName, config);

  const session = await runner.sessionService.createSession({
    appName,
    userId,
    state,
  });

  sessionConfigs.set(session.id, config);
  res.json({ id: session.id });
});

app.post("/run_sse", async (req, res) => {
  const { appName, userId, sessionId, newMessage, agentConfig } = req.body;

  const config: AgentConfig = agentConfig ?? sessionConfigs.get(sessionId) ?? {};
  if (agentConfig) sessionConfigs.set(sessionId, agentConfig);

  const runner = getOrCreateRunner(appName, config);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const events = runner.runAsync({
      userId,
      sessionId,
      newMessage,
    });

    for await (const event of events) {
      console.log("[server] event:", JSON.stringify(event, null, 2).slice(0, 1000));
      if (event.errorCode) {
        res.write(`data: ${JSON.stringify({ errorCode: event.errorCode, errorMessage: event.errorMessage })}\n\n`);
        continue;
      }
      if (event.content) {
        res.write(`data: ${JSON.stringify({ content: event.content })}\n\n`);
      }
    }
  } catch (err) {
    console.error("[server] runAsync error:", err);
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

const PORT = parseInt(process.env.PORT ?? "8000", 10);
app.listen(PORT, () => {
  console.log(`Agent server listening on :${PORT}`);
});
