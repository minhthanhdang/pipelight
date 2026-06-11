import { withAuth } from "@/lib/auth-middleware";
import { FIVETRAN_BASE, getUserAuthHeader } from "@/lib/fivetran";

export const POST = withAuth(async (session, req: Request) => {
  const { connectorId } = await req.json();
  if (!connectorId) {
    return Response.json({ error: "Missing connectorId" }, { status: 400 });
  }

  let authHeader: string;
  try {
    authHeader = await getUserAuthHeader(session.user.id);
  } catch {
    return Response.json({ error: "Fivetran API keys not configured" }, { status: 403 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/connect-card/callback`;

  const res = await fetch(`${FIVETRAN_BASE}/connections/${connectorId}/connect-card`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connect_card_config: { redirect_uri: redirectUri },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json(
      { error: `Fivetran Connect Card failed (${res.status}): ${text}` },
      { status: res.status },
    );
  }

  const data = await res.json();
  const connectCardUri = data.data?.connect_card?.uri ?? data.uri;

  return Response.json({ connectCardUri });
});
