"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { SyncStatsResponse } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const chartConfig = {
  rate: { label: "Success Rate", color: "var(--accent-green-bright)" },
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
  const dailyRates = data?.daily.map((d) => {
    const total = d.success + d.failure;
    return { date: d.date, rate: total > 0 ? Math.round((d.success / total) * 100) : 0 };
  }) ?? [];

  return (
    <Card className="lg:col-span-3">
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
            {dailyRates.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <LineChart data={dailyRates} accessibilityLayer>
                  <defs>
                    <filter id="glowLine" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                  <ChartTooltip formatter={(value) => [`${value}%`, "Success Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={{ r: 3 }} filter="url(#glowLine)" />
                </LineChart>
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
