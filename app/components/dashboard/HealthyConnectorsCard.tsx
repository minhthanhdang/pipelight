"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CheckCircle2, Inbox } from "lucide-react";
import type { HealthyConnectorsResponse } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const PERIODS = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "quarter", label: "90 days" },
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HealthyConnectorsCard() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<HealthyConnectorsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/api/dashboard/healthy-connectors?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Healthy Connectors</CardTitle>
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
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading…</div>
        ) : data && data.connectors.length > 0 ? (
          <ul className="space-y-2">
            {data.connectors.map((c) => (
              <li key={c.fivetranId} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">{c.service}</span>
                </div>
                {c.lastSyncedAt && (
                  <span className="text-xs text-muted-foreground">{relativeTime(c.lastSyncedAt)}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
            <Inbox className="h-5 w-5" />
            No fully healthy connectors
          </div>
        )}
      </CardContent>
    </Card>
  );
}
