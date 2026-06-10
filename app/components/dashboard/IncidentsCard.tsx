"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import type { IncidentsResponse } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const chartConfig = {
  syncFailures: { label: "Sync Failures", color: "var(--chart-5)" },
  auditCriticals: { label: "Audit Criticals", color: "var(--chart-3)" },
} satisfies ChartConfig;

const PERIODS = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "quarter", label: "90 days" },
];

export function IncidentsCard() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<IncidentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/api/dashboard/incidents?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Incidents by Connector</CardTitle>
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
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={data.connectors} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="service" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="syncFailures" stackId="incidents" fill="var(--color-syncFailures)" radius={[0, 0, 0, 0]} barSize={32} />
              <Bar dataKey="auditCriticals" stackId="incidents" fill="var(--color-auditCriticals)" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No incidents detected</div>
        )}
      </CardContent>
    </Card>
  );
}
