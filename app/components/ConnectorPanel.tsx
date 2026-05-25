"use client";

import { useEffect, useState, useCallback } from "react";
import { CONNECTOR_MAP, type ConnectorState } from "@/lib/connectors";
import PanelHeader from "./panel/PanelHeader";
import ConnectorStatus from "./panel/ConnectorStatus";
import BreakActions from "./panel/BreakActions";

interface ConnectorPanelProps {
  selectedNode: string | null;
  onClose: () => void;
}

export default function ConnectorPanel({ selectedNode, onClose }: ConnectorPanelProps) {
  const [state, setState] = useState<ConnectorState | null>(null);
  const [loading, setLoading] = useState(false);

  const mapping = selectedNode ? CONNECTOR_MAP[selectedNode] : null;
  const connectorId = mapping?.connectorIds[0];

  const fetchState = useCallback(async () => {
    if (!connectorId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/connectors/${connectorId}`);
      if (res.ok) {
        setState(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [connectorId]);

  useEffect(() => {
    if (selectedNode && connectorId) {
      fetchState();
    } else {
      setState(null);
    }
  }, [selectedNode, connectorId, fetchState]);

  if (!mapping) return null;

  return (
    <div
      className={`fixed top-12 right-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-200 ${
        selectedNode ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <PanelHeader mapping={mapping} setupState={state?.setup_state} onClose={onClose} />
      <ConnectorStatus state={state} loading={loading} />
      <BreakActions mapping={mapping} onActionComplete={fetchState} />
    </div>
  );
}
