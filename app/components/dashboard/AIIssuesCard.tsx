"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDashboardIssues } from "@/hooks/queries";

function judgementBadge(judgement: string) {
  if (judgement === "failure")
    return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"><AlertCircle className="h-3 w-3" />Failure</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"><AlertTriangle className="h-3 w-3" />Warning</span>;
}

export function AIIssuesCard() {
  const { data: issues = [], isLoading } = useDashboardIssues();

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle>Audit Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {judgementBadge(issue.judgement)}
                    <span className="text-xs text-muted-foreground font-mono">{issue.fivetranId}</span>
                  </div>
                  <p className="text-sm font-medium">{issue.directCause}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{issue.analysis}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
