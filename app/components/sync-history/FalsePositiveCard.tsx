"use client";

import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { useFalsePositiveStats } from "@/hooks/queries";

const chartConfig = {
  clean: { label: "Clean", color: "var(--chart-success)" },
  warning: { label: "Warning", color: "var(--chart-3)" },
  critical: { label: "Critical", color: "var(--chart-5)" },
} satisfies ChartConfig;

function StatRow({ label, color, count, total }: { label: string; color: string; count: number; total: number }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium tabular-nums">
        {count} <span className="text-muted-foreground font-normal">({pct}%)</span>
      </span>
    </div>
  );
}

export function FalsePositiveCard({
  className,
  queryParams,
}: {
  className?: string;
  queryParams: { connectorId?: string; start?: string; end?: string } | null;
}) {
  const { data, isLoading } = useFalsePositiveStats(
    queryParams?.connectorId
      ? { connectorId: queryParams.connectorId, start: queryParams.start, end: queryParams.end }
      : null,
  );
  const stats = data?.falsePositives ?? null;

  const barData = stats
    ? [
        {
          name: "successes",
          clean: stats.totalSuccess - stats.warning - stats.critical,
          warning: stats.warning,
          critical: stats.critical,
        },
      ]
    : [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>False Positives</CardTitle>
        <CardDescription>Successful syncs flagged by audit</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">Loading…</div>
        ) : !queryParams || !stats || stats.totalSuccess === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No successful syncs in this period
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <StatRow label="Warning" color={chartConfig.warning.color} count={stats.warning} total={stats.totalSuccess} />
              <StatRow label="Critical" color={chartConfig.critical.color} count={stats.critical} total={stats.totalSuccess} />
            </div>
            <ChartContainer config={chartConfig} className="h-16 w-full">
              <BarChart accessibilityLayer data={barData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis type="number" hide domain={[0, stats.totalSuccess]} />
                <YAxis type="category" dataKey="name" hide />
                <ChartTooltip
                  formatter={(value, name) => [`${value}`, chartConfig[name as keyof typeof chartConfig]?.label ?? name]}
                />
                <Bar dataKey="clean" stackId="a" fill={chartConfig.clean.color} radius={[4, 0, 0, 4]} />
                <Bar dataKey="warning" stackId="a" fill={chartConfig.warning.color} />
                <Bar dataKey="critical" stackId="a" fill={chartConfig.critical.color} radius={[0, 4, 4, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
