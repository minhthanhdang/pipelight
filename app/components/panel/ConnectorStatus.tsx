"use client";

import { type ConnectorState } from "@/lib/connectors";

interface ConnectorStatusProps {
  state: ConnectorState | null;
  loading: boolean;
}

function StatusDot({ value }: { value: string | undefined }) {
  const color =
    value === "connected" || value === "syncing" || value === "scheduled"
      ? "bg-green-500"
      : value === "paused"
        ? "bg-yellow-500"
        : value === "broken" || value === "sync_failed"
          ? "bg-red-500"
          : "bg-gray-400";

  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function timeAgo(iso: string | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ConnectorStatus({ state, loading }: ConnectorStatusProps) {
  if (loading) {
    return (
      <div className="px-4 py-3 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!state) return null;

  const rows = [
    { label: "Setup State", value: state.setup_state, dot: true },
    { label: "Sync State", value: state.paused ? "paused" : state.sync_state, dot: true },
    { label: "Schema Changes", value: state.schema_change_handling, dot: false },
    { label: "Last Sync", value: timeAgo(state.succeeded_at), dot: false },
  ];

  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{row.label}</span>
            <span className="flex items-center gap-1.5 text-gray-900 font-medium">
              {row.dot && <StatusDot value={row.value} />}
              {row.value ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
