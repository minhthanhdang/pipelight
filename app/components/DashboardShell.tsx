"use client";

import { usePathname } from "next/navigation";
import { useAIStore } from "@/stores/useAIStore";
import Link from "next/link";
import { SidebarProvider } from "@/components/sidebar/SidebarContext";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import ChatToggleButton from "@/components/chat/ChatToggleButton";
import { useFivetranKeys } from "@/hooks/useFivetranKeys";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const chatOpen = useAIStore((s) => s.chatOpen);
  const setChatOpen = useAIStore((s) => s.setChatOpen);
  const { hasKeys, loading } = useFivetranKeys();
  const pathname = usePathname();

  const isSettingsPage = pathname === "/settings";
  const showGuard = !loading && !hasKeys && !isSettingsPage;

  return (
    <SidebarProvider>
      <div className="mx-auto flex h-screen w-full max-w-[1560px] flex-col px-16 pt-12">
        <div className="flex h-14 items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
            S
          </div>
          <span className="font-semibold text-sm whitespace-nowrap">SyncGuard</span>
        </div>
        <div className="flex flex-1 min-h-0">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto h-full max-w-[1280px]">
            {showGuard ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-md space-y-4">
                  <h2 className="text-xl font-semibold">Fivetran API Keys Required</h2>
                  <p className="text-muted-foreground">
                    Configure your Fivetran API key and secret in Settings to get started.
                  </p>
                  <Link
                    href="/settings"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Go to Settings
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
        <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
        <ChatToggleButton visible={!chatOpen} />
        </div>
      </div>
    </SidebarProvider>
  );
}
