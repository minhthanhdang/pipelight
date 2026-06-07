import { signOut } from "next-auth/react";

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    await signOut({ redirectTo: "/login" });
    throw new Error("Session expired");
  }
  return res;
}
