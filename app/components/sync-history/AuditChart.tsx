"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { useAuditDistribution } from "@/hooks/queries";

const chartConfig = {
  clean: { label: "Clean", color: "var(--chart-success)" },
  warning: { label: "Warning", color: "var(--chart-3)" },
  critical: { label: "Critical", color: "var(--chart-5)" },
} satisfies ChartConfig;

function buildMonthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return { value: format(d, "yyyy-MM"), label: format(d, "MMM yyyy") };
  });
}

function RangeDatePicker({
  range,
  onSelect,
}: {
  range: DateRange | undefined;
  onSelect: (r: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = range?.from
    ? range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "Pick date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs font-normal">
            <CalendarIcon className="size-3" />
            {label}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={range}
          onSelect={onSelect}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function AuditChart({ className, connectorId }: { className?: string; connectorId?: string }) {
  const [mode, setMode] = useState<"all" | "month" | "custom">("all");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const monthOptions = useMemo(buildMonthOptions, []);

  const queryParams = useMemo(() => {
    if (mode === "all") {
      return { connectorId };
    }
    if (mode === "month") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const base = new Date(y, m - 1, 1);
      return { start: startOfMonth(base).toISOString(), end: endOfMonth(base).toISOString(), connectorId };
    }
    if (customRange?.from && customRange?.to) {
      return { start: customRange.from.toISOString(), end: customRange.to.toISOString(), connectorId };
    }
    return null;
  }, [mode, selectedMonth, customRange, connectorId]);

  const { data, isLoading } = useAuditDistribution(queryParams);
  const distribution = data?.distribution ?? null;

  const pieData = distribution
    ? [
        { name: "clean", value: distribution.clean },
        { name: "warning", value: distribution.warning },
        { name: "critical", value: distribution.critical },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sync Audits</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            <Select value={mode} onValueChange={(v) => v && setMode(v as "all" | "month" | "custom")}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show All</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {mode === "month" ? (
              <Select value={selectedMonth} onValueChange={(v) => v && setSelectedMonth(v)}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : mode === "custom" ? (
              <RangeDatePicker range={customRange} onSelect={setCustomRange} />
            ) : null}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading…</div>
        ) : mode === "custom" && !queryParams ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Select start and end dates</div>
        ) : pieData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto h-48 w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip
                formatter={(value, name) => [`${value}`, chartConfig[name as keyof typeof chartConfig]?.label ?? name]}
              />
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={chartConfig[entry.name as keyof typeof chartConfig].color} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No audit data for this period</div>
        )}
      </CardContent>
    </Card>
  );
}
