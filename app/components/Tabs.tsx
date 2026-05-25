"use client";

import { useState } from "react";

const tabs = ["Example"] as const;

export default function Tabs({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<string>("Example");

  return (
    <div className="flex flex-col h-screen">
      <nav className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 h-12 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              active === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
