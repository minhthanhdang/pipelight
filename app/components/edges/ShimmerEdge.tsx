"use client";

import {
  getBezierPath,
  type EdgeProps,
  BaseEdge,
} from "@xyflow/react";

export default function ShimmerEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: "#e2e8f0", strokeWidth: 2 }} />
      <path
        d={edgePath}
        fill="none"
        stroke="url(#shimmer-gradient)"
        strokeWidth={3}
        strokeDasharray="8 12"
        className="shimmer-edge"
      />
    </>
  );
}
