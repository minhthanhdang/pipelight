"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export default function BigQueryNode({ data }: NodeProps) {
  return (
    <div className="rounded-xl border-2 border-blue-500 bg-white px-8 py-6 shadow-lg min-w-[200px] text-center">
      <Handle id="top" type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle id="left" type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle id="bottom" type="target" position={Position.Bottom} className="!bg-blue-500" />
      <div className="flex items-center justify-center gap-3">
        <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 53.5l-3-26L32 13l20.5 14.5-3 26L32 61z" fill="#4386FA"/>
          <path d="M44.5 36.5a12.5 12.5 0 10-18.7 10.8L24 53.5h16l-1.8-6.2a12.4 12.4 0 006.3-10.8z" fill="#4386FA"/>
          <path d="M32 24a12.5 12.5 0 00-6.2 23.3L24 53.5h16l-1.8-6.2A12.5 12.5 0 0032 24zm0 4a8.5 8.5 0 110 17 8.5 8.5 0 010-17z" fill="#fff" fillOpacity="0.4"/>
          <path d="M36 35l3 3-7 7-3-3z" fill="#fff"/>
          <circle cx="30" cy="34" r="5" fill="none" stroke="#fff" strokeWidth="2.5"/>
          <rect x="30" y="3" width="4" height="10" rx="2" fill="#4386FA"/>
          <rect x="4" y="27" width="10" height="4" rx="2" fill="#4386FA"/>
          <rect x="50" y="27" width="10" height="4" rx="2" fill="#4386FA"/>
        </svg>
        <div className="text-lg font-bold text-blue-600">
          {data.label as string}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">glade_several</div>
    </div>
  );
}
