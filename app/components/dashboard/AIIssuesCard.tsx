"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { IssueItem } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

function severityBadge(severity: string) {
  if (severity === "critical")
    return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"><AlertCircle className="h-3 w-3" />Critical</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"><AlertTriangle className="h-3 w-3" />Warning</span>;
}

const TYPE_LABELS: Record<string, string> = {
  connection_failure: "Connection Failure",
  schema_drift: "Schema Drift",
  data_quality: "Data Quality",
};

export function AIIssuesCard() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/dashboard/issues")
      .then((r) => r.json())
      .then(setIssues)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Detected Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">Loading…</div>
        ) : issues.length === 0 ? (
          <div className="flex items-center gap-2 py-8 justify-center text-sm text-success">
            <CheckCircle2 className="h-5 w-5" />
            No issues detected
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {issues.map((issue) => (
              <li key={issue.id} className="flex items-start gap-3 rounded-md border p-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {severityBadge(issue.severity)}
                    <span className="text-xs text-muted-foreground">{TYPE_LABELS[issue.type] ?? issue.type}</span>
                  </div>
                  <p className="text-sm font-medium">{issue.title}</p>
                  {issue.fivetranId && <p className="text-xs text-muted-foreground font-mono">{issue.fivetranId}</p>}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(issue.detectedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
