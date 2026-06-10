import { type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { FIVETRAN_BASE, getUserAuthHeader } from "@/lib/fivetran";

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
  const body = await req.json().catch(() => ({}));
  const redirectUri = body.redirect_uri
    ?? `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/connect-card/callback`;

  const res = await fetch(`${FIVETRAN_BASE}/connections/${id}/connect-card`, {
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
    return Response.json({ error: `Fivetran Connect Card failed (${res.status}): ${text}` }, { status: res.status });
  }

  const data = await res.json();
  return Response.json({ uri: data.data?.connect_card?.uri ?? data.uri });
});
