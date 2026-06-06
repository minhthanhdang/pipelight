"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import NodeCard from "./NodeCard";

interface SourceNodeConfig {
  glowClass: string;
  handleColor: string;
  icon: React.ReactNode;
  handlePosition?: Position;
}

export default function createSourceNode(config: SourceNodeConfig) {
  const {
    glowClass,
    handleColor,
    icon,
    handlePosition = Position.Bottom,
  } = config;

  return function SourceNode({ selected }: NodeProps) {
    return (
      <NodeCard glowClass={glowClass} selected={selected}>
        <div className="flex items-center justify-center cursor-pointer">
          {icon}
        </div>
        <Handle type="source" position={handlePosition} className={handleColor} />
      </NodeCard>
    );
  };
}
