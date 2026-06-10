"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertTriangle, AlertCircle, ShieldCheck, XCircle } from "lucide-react";
import type { HealthResponse, HealthIncidentItem } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const PERIODS = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "quarter", label: "90 days" },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function incidentBadge(item: HealthIncidentItem) {
  if (item.kind === "sync_failure")
    return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"><XCircle className="h-3 w-3" />Sync</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"><AlertCircle className="h-3 w-3" />Audit</span>;
}

export function PipelineHealthCard() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/api/dashboard/health?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Data Health</CardTitle>
        <CardAction>
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">Loading…</div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className={`text-5xl font-bold ${scoreColor(data.score)}`}>{data.score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>{data.syncFailureCount} sync failures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span>{data.auditCriticalCount} critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>{data.auditWarningCount} warnings</span>
              </div>
            </div>
            {data.recentIncidents.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Incidents</p>
                <ul className="space-y-1.5">
                  {data.recentIncidents.map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        {incidentBadge(item)}
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-success">
                <ShieldCheck className="h-4 w-4" />
                No critical incidents detected
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
