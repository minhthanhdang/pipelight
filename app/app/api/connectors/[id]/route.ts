import { type NextRequest } from "next/server";

const FIVETRAN_BASE = "https://api.fivetran.com/v1";

function getAuthHeader() {
  const key = process.env.FIVETRAN_API_KEY;
  const secret = process.env.FIVETRAN_API_SECRET;
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${FIVETRAN_BASE}/connectors/${id}`, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!res.ok) {
    return Response.json(
      { error: `Fivetran API error: ${res.status}` },
      { status: res.status }
    );
  }

  const json = await res.json();
  const c = json.data;

  return Response.json({
    id: c.id,
    paused: c.paused,
    sync_frequency: c.sync_frequency,
    schema_change_handling: c.schema_change_handling,
    setup_state: c.status?.setup_state,
    sync_state: c.status?.sync_state,
    succeeded_at: c.succeeded_at,
    failed_at: c.failed_at,
    service: c.service,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

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
    return Response.json(
      { error: `Fivetran API error: ${res.status}`, details: text },
      { status: res.status }
    );
  }

  const json = await res.json();
  return Response.json(json.data);
}
