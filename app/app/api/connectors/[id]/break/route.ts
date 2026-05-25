import { type NextRequest } from "next/server";

const FIVETRAN_BASE = "https://api.fivetran.com/v1";

function getAuthHeader() {
  const key = process.env.FIVETRAN_API_KEY;
  const secret = process.env.FIVETRAN_API_SECRET;
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

async function patchConnector(id: string, body: Record<string, unknown>) {
  const res = await fetch(`${FIVETRAN_BASE}/connectors/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: getAuthHeader(),
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await req.json();

  try {
    switch (action) {
      case "rotate_password": {
        await patchConnector(id, {
          config: { password: "INVALID_PASSWORD_DEMO_BREAK" },
        });
        return Response.json({ success: true, action, message: "Password rotated to invalid value" });
      }
      case "allow_schema": {
        await patchConnector(id, { schema_change_handling: "ALLOW_ALL" });
        return Response.json({ success: true, action, message: "Schema change handling set to ALLOW_ALL" });
      }
      case "block_schema": {
        await patchConnector(id, { schema_change_handling: "BLOCK_ALL" });
        return Response.json({ success: true, action, message: "Schema change handling set to BLOCK_ALL" });
      }
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
