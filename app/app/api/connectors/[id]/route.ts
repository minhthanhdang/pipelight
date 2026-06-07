import { type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { FIVETRAN_BASE, getUserAuthHeader } from "@/lib/fivetran";

export const GET = withAuth(async (
  session,
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(session.user.id);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  const { id } = await params;

  const res = await fetch(`${FIVETRAN_BASE}/connectors/${id}`, {
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    return Response.json(
      { error: `Fivetran API error: ${res.status}` },
      { status: res.status },
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
});

export const PATCH = withAuth(async (
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
  const body = await req.json();

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
    return Response.json(
      { error: `Fivetran API error: ${res.status}`, details: text },
      { status: res.status },
    );
  }

  const json = await res.json();
  return Response.json(json.data);
});
