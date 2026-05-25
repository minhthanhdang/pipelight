"use client";

import { type ConnectorMapping } from "@/lib/connectors";

const icons: Record<ConnectorMapping["type"], string> = {
  postgres: "🐘",
  sheets: "📊",
  gcs: "🪣",
};

interface PanelHeaderProps {
  mapping: ConnectorMapping;
  setupState?: string;
  onClose: () => void;
}

export default function PanelHeader({ mapping, setupState, onClose }: PanelHeaderProps) {
  const stateColor =
    setupState === "connected"
      ? "bg-green-500"
      : setupState === "broken"
        ? "bg-red-500"
        : "bg-gray-400";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icons[mapping.type]}</span>
        <span className="font-semibold text-gray-900">{mapping.label}</span>
        <span className={`w-2 h-2 rounded-full ${stateColor}`} />
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
}
