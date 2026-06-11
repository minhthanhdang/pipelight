"use client";

import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConnectorOption, SyncSummaryItem } from "@/lib/dashboard-types";
import { LoadConnectorsCTA } from "@/components/LoadConnectorsCTA";
import { useSummaries, useGenerateSummary } from "@/hooks/queries";

type Period = "last_week" | "last_month";

export default function SummariesClient({
  connectors,
  hasKeys,
}: {
  connectors: ConnectorOption[];
  hasKeys: boolean;
}) {
  const [connectorId, setConnectorId] = useState("");
  const [period, setPeriod] = useState<Period>("last_week");

  const { data, isLoading } = useSummaries(connectorId || undefined);
  const generateMutation = useGenerateSummary(connectorId || undefined);

  const summaries = data?.summaries ?? [];

  async function handleGenerate() {
    await generateMutation.mutateAsync({
      connectorId: connectorId || undefined,
      period,
    });
  }

  if (connectors.length === 0 && hasKeys) {
    return (
      <div className="p-6 space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-2xl font-medium text-muted-foreground">
            AI Summaries
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate AI-powered summaries of your sync health
          </p>
        </div>
        <LoadConnectorsCTA />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-medium text-muted-foreground">
          AI Summaries
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate AI-powered summaries of your sync health
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={connectorId}
          onChange={(e) => setConnectorId(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All connectors</option>
          {connectors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="last_week">Last 7 days</option>
          <option value="last_month">Last 30 days</option>
        </select>

        <Button size="sm" onClick={handleGenerate} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Summary
            </>
          )}
        </Button>
      </div>

      {generateMutation.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {generateMutation.error.message}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No summaries yet. Generate one above.
          </div>
        ) : (
          summaries.map((s) => (
            <SummaryCard key={s.id} summary={s} connectors={connectors} />
          ))
        )}
      </div>
    </div>
  );
}

const mdComponents: Components = {
  h1: ({ children }) => <h1 className="text-xl font-semibold mt-5 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-0.5">{children}</h4>,
  p: ({ children }) => <p className="text-sm leading-relaxed my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1 text-sm">{children}</ol>,
  li: ({ children }) => <li className="my-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-border pl-3 text-muted-foreground my-2">{children}</blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-2 rounded-lg bg-muted p-3 overflow-x-auto">
          <code className="text-xs font-mono">{children}</code>
        </pre>
      );
    }
    return <code className="text-[0.85em] px-1 py-0.5 rounded bg-muted font-mono">{children}</code>;
  },
  hr: () => <hr className="border-t border-border my-3" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b-2 border-border">{children}</thead>,
  th: ({ children }) => <th className="text-left font-semibold px-2 py-1.5">{children}</th>,
  td: ({ children }) => <td className="px-2 py-1 border-b border-border">{children}</td>,
};

function SummaryCard({
  summary,
  connectors,
}: {
  summary: SyncSummaryItem;
  connectors: ConnectorOption[];
}) {
  const connector = summary.connectorId
    ? connectors.find((c) => c.id === summary.connectorId)
    : null;

  const periodLabel =
    summary.periodLabel === "last_week"
      ? "Last 7 days"
      : summary.periodLabel === "last_month"
        ? "Last 30 days"
        : summary.periodLabel;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {connector ? connector.label : "All Connectors"} — {periodLabel}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {new Date(summary.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(summary.periodStart).toLocaleDateString()} –{" "}
          {new Date(summary.periodEnd).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {summary.summary}
        </Markdown>
      </CardContent>
    </Card>
  );
}
