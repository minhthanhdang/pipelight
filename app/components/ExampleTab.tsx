"use client";

import {
  ReactFlow,
  Controls,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import BigQueryNode from "./nodes/BigQueryNode";
import PostgresNode from "./nodes/PostgresNode";
import SheetsNode from "./nodes/SheetsNode";
import GCSNode from "./nodes/GCSNode";
import ShimmerEdge from "./edges/ShimmerEdge";
import { nodes, edges } from "@/lib/flowConfig";

const nodeTypes: NodeTypes = {
  bigquery: BigQueryNode,
  postgres: PostgresNode,
  sheets: SheetsNode,
  gcs: GCSNode,
};

const edgeTypes: EdgeTypes = {
  shimmer: ShimmerEdge,
};

export default function ExampleTab() {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <svg>
          <defs>
            <linearGradient
              id="shimmer-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </svg>
      </ReactFlow>
    </div>
  );
}
