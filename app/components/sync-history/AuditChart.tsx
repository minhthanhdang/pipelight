"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import type { AuditBucket, AuditChartResponse } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const chartConfig = {
  rate: { label: "Success Rate", color: "var(--success)" },
} satisfies ChartConfig;

const PERIODS = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

export function AuditChart() {
  const [period, setPeriod] = useState("week");
  const [buckets, setBuckets] = useState<AuditBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/api/sync-history/audits?period=${period}`)
      .then((r) => r.json())
      .then((data: AuditChartResponse) => setBuckets(data.buckets))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audits</CardTitle>
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
        ) : buckets.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart data={buckets} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
              <ChartTooltip
                formatter={(value, _name, item) => [
                  `${value}% (${item.payload.total} syncs)`,
                  "Success Rate",
                ]}
              />
              <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No audit data yet</div>
        )}
      </CardContent>
    </Card>
  );
}
