import { type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { FIVETRAN_BASE, getUserAuthHeader } from "@/lib/fivetran";

async function patchConnector(id: string, body: Record<string, unknown>, authHeader: string) {
  const res = await fetch(`${FIVETRAN_BASE}/connectors/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fivetran PATCH failed (${res.status}): ${text}`);
  }
  return res.json();
}

export const POST = withAuth(async (
  session,
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(session.user.id);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json();

  try {
    switch (action) {
      case "rotate_password": {
        await patchConnector(id, {
          config: { password: "INVALID_PASSWORD_DEMO_BREAK" },
        }, authHeader);
        return Response.json({ success: true, action, message: "Password rotated to invalid value" });
      }
      case "allow_schema": {
        await patchConnector(id, { schema_change_handling: "ALLOW_ALL" }, authHeader);
        return Response.json({ success: true, action, message: "Schema change handling set to ALLOW_ALL" });
      }
      case "block_schema": {
        await patchConnector(id, { schema_change_handling: "BLOCK_ALL" }, authHeader);
        return Response.json({ success: true, action, message: "Schema change handling set to BLOCK_ALL" });
      }
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
});
