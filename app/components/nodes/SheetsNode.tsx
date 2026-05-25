"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export default function SheetsNode({ data }: NodeProps) {
  return (
    <div className="rounded-xl border-2 border-green-400 bg-white px-6 py-4 shadow-md min-w-[180px] text-center">
      <div className="flex items-center justify-center gap-2">
        <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M38 4H14a4 4 0 00-4 4v48a4 4 0 004 4h36a4 4 0 004-4V20L38 4z" fill="#0F9D58"/>
          <path d="M38 4v16h16" fill="#87CEAC"/>
          <rect x="18" y="30" width="28" height="20" rx="1" fill="#fff" fillOpacity="0.9"/>
          <line x1="18" y1="37" x2="46" y2="37" stroke="#0F9D58" strokeWidth="1"/>
          <line x1="18" y1="43" x2="46" y2="43" stroke="#0F9D58" strokeWidth="1"/>
          <line x1="30" y1="30" x2="30" y2="50" stroke="#0F9D58" strokeWidth="1"/>
        </svg>
        <div className="text-sm font-semibold text-green-600">
          {data.label as string}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">pharmacy_ops</div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-400" />
    </div>
  );
}
