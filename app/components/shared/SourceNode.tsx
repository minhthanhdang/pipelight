"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import NodeCard from "./NodeCard";

interface SourceNodeConfig {
  borderColor: string;
  textColor: string;
  handleColor: string;
  subtitle: string;
  icon: React.ReactNode;
  handlePosition?: Position;
}

export default function createSourceNode(config: SourceNodeConfig) {
  const {
    borderColor,
    textColor,
    handleColor,
    subtitle,
    icon,
    handlePosition = Position.Bottom,
  } = config;

  return function SourceNode({ data, selected }: NodeProps) {
    return (
      <NodeCard borderColor={selected ? "border-blue-500 ring-2 ring-blue-200" : borderColor}>
        <div className="flex items-center justify-center gap-2 cursor-pointer">
          {icon}
          <div className={`text-sm font-semibold ${textColor}`}>
            {data.label as string}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        <Handle type="source" position={handlePosition} className={handleColor} />
      </NodeCard>
    );
  };
}
