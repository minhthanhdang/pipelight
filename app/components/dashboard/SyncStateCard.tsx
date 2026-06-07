"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { SyncStatsResponse } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const chartConfig = {
  success: { label: "Success", color: "var(--success)" },
  failure: { label: "Failure", color: "var(--destructive)" },
} satisfies ChartConfig;

const PERIODS = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
];

export function SyncStateCard() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<SyncStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/api/dashboard/syncs?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  const successRate = data && data.total > 0 ? Math.round((data.successes / data.total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync State</CardTitle>
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
        ) : data ? (
          <div className="space-y-4">
            <div className="flex gap-6 text-sm">
              <div><span className="text-2xl font-bold">{data.total}</span> <span className="text-muted-foreground">total</span></div>
              <div><span className="text-2xl font-bold text-success">{successRate}%</span> <span className="text-muted-foreground">success</span></div>
              <div><span className="text-2xl font-bold text-destructive">{data.failures}</span> <span className="text-muted-foreground">failures</span></div>
            </div>
            {data.daily.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <BarChart data={data.daily} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="success" stackId="a" fill="var(--color-success)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="failure" stackId="a" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No sync data yet</div>
            )}
            {data.topFailures.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Failing Connectors</p>
                <div className="space-y-1">
                  {data.topFailures.map((f) => (
                    <div key={f.fivetranId} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs">{f.service}</span>
                      <span className="text-destructive font-medium">{f.failureCount} failures</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
