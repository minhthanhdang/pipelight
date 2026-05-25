"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export default function GCSNode({ data }: NodeProps) {
  return (
    <div className="rounded-xl border-2 border-amber-400 bg-white px-6 py-4 shadow-md min-w-[180px] text-center">
      <div className="flex items-center justify-center gap-2">
        <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 20h32l-4 32H20z" fill="#F4B400"/>
          <ellipse cx="32" cy="20" rx="16" ry="6" fill="#F9D44B"/>
          <ellipse cx="32" cy="20" rx="16" ry="6" fill="none" stroke="#E8A400" strokeWidth="1"/>
          <path d="M16 20c0 3.3 7.2 6 16 6s16-2.7 16-6" fill="none" stroke="#E8A400" strokeWidth="0.5" opacity="0.5"/>
          <path d="M18 30c0 2.5 6.3 4.5 14 4.5s14-2 14-4.5" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6"/>
          <path d="M19 40c0 2.2 5.8 4 13 4s13-1.8 13-4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6"/>
        </svg>
        <div className="text-sm font-semibold text-amber-600">
          {data.label as string}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">lab_results</div>
      <Handle type="source" position={Position.Top} className="!bg-amber-400" />
    </div>
  );
}
