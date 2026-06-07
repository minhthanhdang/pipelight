import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SyncHistoryClient from "./sync-history-client";

export default async function SyncHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const connectors = await prisma.connector.findMany({
    where: { userId: session.user.id },
    select: { id: true, service: true },
    orderBy: { service: "asc" },
  });

  return <SyncHistoryClient connectors={connectors} />;
}
