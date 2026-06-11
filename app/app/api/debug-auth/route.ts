import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET() {
  const h = await headers();
  const cookieHeader = h.get("cookie") ?? "(null)";
  const hasCookie = cookieHeader.includes("authjs.session-token");

  let session = null;
  let authError = null;
  try {
    session = await auth();
  } catch (e: unknown) {
    authError = e instanceof Error ? e.message : String(e);
  }

  return Response.json({
    hasCookie,
    cookieNames: cookieHeader === "(null)" ? [] : cookieHeader.split(";").map((c: string) => c.trim().split("=")[0]),
    session: session ? { userId: session.user?.id, email: session.user?.email } : null,
    authError,
    proto: h.get("x-forwarded-proto"),
    host: h.get("x-forwarded-host") ?? h.get("host"),
  });
}
