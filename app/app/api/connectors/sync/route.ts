import { withAuth } from "@/lib/auth-middleware";
import { syncConnectorsForUser } from "@/lib/connector-sync";

export const POST = withAuth(async (session) => {
  try {
    const result = await syncConnectorsForUser(session.user.id);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "Fivetran API keys not configured") {
      return Response.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }
});
