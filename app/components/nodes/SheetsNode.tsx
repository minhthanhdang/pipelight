"use client";

import { Position } from "@xyflow/react";
import createSourceNode from "../shared/SourceNode";

const icon = (
  <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 4H14a4 4 0 00-4 4v48a4 4 0 004 4h36a4 4 0 004-4V20L38 4z" fill="#0F9D58"/>
    <path d="M38 4v16h16" fill="#87CEAC"/>
    <rect x="18" y="30" width="28" height="20" rx="1" fill="#fff" fillOpacity="0.9"/>
    <line x1="18" y1="37" x2="46" y2="37" stroke="#0F9D58" strokeWidth="1"/>
    <line x1="18" y1="43" x2="46" y2="43" stroke="#0F9D58" strokeWidth="1"/>
    <line x1="30" y1="30" x2="30" y2="50" stroke="#0F9D58" strokeWidth="1"/>
  </svg>
);

export default createSourceNode({
  glowClass: "node-glow-green",
  handleColor: "!bg-green-400",
  icon,
  handlePosition: Position.Bottom,
});
