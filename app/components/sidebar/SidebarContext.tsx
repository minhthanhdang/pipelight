"use client";

import { createContext, useContext, useState, useCallback } from "react";

type SidebarContextType = {
  expanded: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const toggleSidebar = useCallback(() => setExpanded((v) => !v), []);

  return (
    <SidebarContext value={{ expanded, toggleSidebar }}>
      {children}
    </SidebarContext>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
