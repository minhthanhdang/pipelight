import { auth } from "@/auth";
import type { Session } from "next-auth";

export type AuthSession = Session & { user: Session["user"] & { id: string } };

export function withAuth<Args extends unknown[]>(
  handler: (session: AuthSession, ...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args): Promise<Response> => {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(session as AuthSession, ...args);
  };
}
