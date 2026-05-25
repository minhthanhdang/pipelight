"use client";

import { Position } from "@xyflow/react";
import createSourceNode from "../shared/SourceNode";

const icon = (
  <svg width="24" height="24" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M93.8 18.6C88 14.8 80.5 13 72 13c-6 0-11.5 1-16.5 3-3-1.5-8-3-14-3C28 13 18 20 18 33c0 5 1 11 4 18 4 11 14 30 28 37 4 2 8 3 12 3 6 0 11-2 15-5 3 1 7 2 11 2 14 0 24-7 28-18 1-3 2-7 2-11 0-15-9-30-24-40z" fill="#336791"/>
    <path d="M72 21c14 0 22 12 22 28 0 3-1 6-1 8-3 9-11 14-21 14-3 0-6-1-9-2l-4 4c-3 3-7 4-11 4-3 0-6-1-9-2C28 68 20 51 17 42c-2-6-3-11-3-15 0-9 7-14 18-14 5 0 9 1 12 3l2 1 3-1C53 13 60 11 67 11" fill="none" stroke="#fff" strokeWidth="3"/>
  </svg>
);

export default createSourceNode({
  borderColor: "border-indigo-400",
  textColor: "text-indigo-600",
  handleColor: "!bg-indigo-400",
  subtitle: "patient_records",
  icon,
  handlePosition: Position.Bottom,
});
