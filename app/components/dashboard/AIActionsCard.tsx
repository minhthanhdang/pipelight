"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Inbox } from "lucide-react";
import type { ActionItem, ActionsResponse } from "@/lib/dashboard-types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export function AIActionsCard() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchWithAuth("/api/dashboard/actions")
      .then((r) => r.json())
      .then((data: ActionsResponse) => {
        setActions(data.actions);
        setCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(() => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    fetchWithAuth(`/api/dashboard/actions?cursor=${cursor}`)
      .then((r) => r.json())
      .then((data: ActionsResponse) => {
        setActions((prev) => [...prev, ...data.actions]);
        setCursor(data.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  }, [cursor, loadingMore]);

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle>AI Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">Loading…</div>
        ) : actions.length === 0 ? (
          <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
            <Inbox className="h-5 w-5" />
            No AI actions yet
          </div>
        ) : (
          <div className="space-y-2">
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {actions.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{a.action}</p>
                      {a.fivetranId && <p className="text-xs text-muted-foreground font-mono">{a.fivetranId}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${a.approved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {a.approved ? "Approved" : "Rejected"}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
            {cursor && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full rounded-md border py-2 text-sm text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
