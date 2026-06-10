const AGENT_API_KEY = process.env.AGENT_API_KEY;

export function withAgentAuth(
  handler: (userId: string, req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    if (!AGENT_API_KEY) {
      return Response.json({ error: "AGENT_API_KEY not configured" }, { status: 500 });
    }
    const key = req.headers.get("x-agent-api-key");
    if (key !== AGENT_API_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "x-user-id header required" }, { status: 400 });
    }
    return handler(userId, req);
  };
}
