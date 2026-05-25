"use client";

import { useState } from "react";
import { type ConnectorMapping, type ConnectorId, getBreakActions } from "@/lib/connectors";

interface BreakActionsProps {
  mapping: ConnectorMapping;
  onActionComplete: () => void;
}

const colorMap: Record<string, string> = {
  red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
  orange: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
};

const emojiMap: Record<string, string> = {
  red: "🔴",
  yellow: "🟡",
  orange: "🟠",
};

export default function BreakActions({ mapping, onActionComplete }: BreakActionsProps) {
  const [running, setRunning] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const actions = getBreakActions(mapping.type);
  const primaryConnectorId = mapping.connectorIds[0];

  async function executeAction(action: string, connectorId: ConnectorId) {
    setRunning(action);
    try {
      const res = await fetch(`/api/connectors/${connectorId}/break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } finally {
      setRunning(null);
      setConfirming(null);
      onActionComplete();
    }
  }

  function handleClick(action: string) {
    if (confirming === action) {
      executeAction(action, primaryConnectorId);
    } else {
      setConfirming(action);
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
        ⚡ Demo Actions
      </div>
      <div className="space-y-2">
        {actions.map(({ action, label, color }) => (
          <button
            key={action}
            onClick={() => handleClick(action)}
            disabled={running !== null}
            className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${colorMap[color]}`}
          >
            {running === action ? (
              <span className="animate-pulse">Running...</span>
            ) : confirming === action ? (
              `Confirm ${label}?`
            ) : (
              `${emojiMap[color]} ${label}`
            )}
          </button>
        ))}
      </div>
      {confirming && !running && (
        <button
          onClick={() => setConfirming(null)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
