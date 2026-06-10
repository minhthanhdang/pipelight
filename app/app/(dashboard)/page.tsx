import { PipelineHealthCard } from "@/components/dashboard/PipelineHealthCard";
import { SyncStateCard } from "@/components/dashboard/SyncStateCard";
import { IncidentsCard } from "@/components/dashboard/IncidentsCard";
import { HealthyConnectorsCard } from "@/components/dashboard/HealthyConnectorsCard";
import { AIIssuesCard } from "@/components/dashboard/AIIssuesCard";
import { AIActionsCard } from "@/components/dashboard/AIActionsCard";

export default function DashboardPage() {
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
