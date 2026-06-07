"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plug,
  ShieldCheck,
  Bot,
  Clock,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Connectors", icon: Plug, href: "/connectors" },
  { label: "Data Quality", icon: ShieldCheck, href: "/data-quality" },
  { label: "Agent", icon: Bot, href: "/agent" },
  { label: "Sync History", icon: Clock, href: "/sync-history" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const { expanded, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex max-h-[840px] flex-col bg-transparent shrink-0 pb-12",
        expanded ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-collapsed)]"
      )}
    >
      <nav className="flex flex-1 items-start justify-center p-3 pt-[24px]">
        <div className="inline-flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          const linkClasses = cn(
            "self-stretch rounded-md py-2 text-sm font-medium transition-colors whitespace-nowrap",
            active
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            !expanded && "px-0"
          );

          if (!expanded) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  render={<Link href={item.href} />}
                  className={cn(linkClasses, "flex items-center justify-center")}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={linkClasses}>
              <div className="flex items-center gap-3 px-4">
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
        </div>
      </nav>

      <div className="flex justify-center p-3">
        <div className="inline-flex flex-col gap-1">
        {!expanded ? (
          <Tooltip>
            <TooltipTrigger
              render={<button onClick={toggleSidebar} />}
              className="flex w-full items-center justify-center rounded-md px-0 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <PanelLeft className="h-4 w-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={toggleSidebar}
            className="self-stretch rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
          >
            <div className="flex items-center gap-3 px-4">
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              Collapse
            </div>
          </button>
        )}

        {!expanded ? (
          <Tooltip>
            <TooltipTrigger
              render={<button onClick={() => signOut({ redirectTo: "/login" })} />}
              className="flex w-full items-center justify-center rounded-md px-0 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right">Log out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => signOut({ redirectTo: "/login" })}
            className="self-stretch rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
          >
            <div className="flex items-center gap-3 px-4">
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </div>
          </button>
        )}
        </div>
      </div>
    </aside>
  );
}
