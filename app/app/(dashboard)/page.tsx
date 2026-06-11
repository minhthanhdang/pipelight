import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PipelineHealthCard } from "@/components/dashboard/PipelineHealthCard";
import { SyncStateCard } from "@/components/dashboard/SyncStateCard";
import { IncidentsCard } from "@/components/dashboard/IncidentsCard";
import { HealthyConnectorsCard } from "@/components/dashboard/HealthyConnectorsCard";
import { AIIssuesCard } from "@/components/dashboard/AIIssuesCard";
import { AIActionsCard } from "@/components/dashboard/AIActionsCard";
import { LoadConnectorsCTA } from "@/components/LoadConnectorsCTA";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [connectorCount, user] = await Promise.all([
    prisma.connector.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { fivetranApiKey: true },
    }),
  ]);

  if (connectorCount === 0 && !!user?.fivetranApiKey) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LoadConnectorsCTA />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <PipelineHealthCard />
        <HealthyConnectorsCard />
        <SyncStateCard />
        <IncidentsCard />
        <AIIssuesCard />
        <AIActionsCard />
      </div>
    </div>
  );
}
