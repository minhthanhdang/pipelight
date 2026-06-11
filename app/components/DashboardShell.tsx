"use client";

import { usePathname } from "next/navigation";
import { useAIStore } from "@/stores/useAIStore";
import Link from "next/link";
import { SidebarProvider } from "@/components/sidebar/SidebarContext";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { useFivetranSettings } from "@/hooks/queries";
import { SparklesIcon } from "lucide-react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const chatOpen = useAIStore((s) => s.chatOpen);
  const setChatOpen = useAIStore((s) => s.setChatOpen);
  const { data: settingsData, isLoading: loading } = useFivetranSettings();
  const hasKeys = settingsData?.hasKeys ?? null;
  const pathname = usePathname();

  const isSettingsPage = pathname === "/settings";
  const showGuard = !loading && !hasKeys && !isSettingsPage;

  return (
    <SidebarProvider>
      <div className="relative mx-auto flex h-screen max-h-[1080px] w-full max-w-[1400px] flex-col overflow-x-clip px-16 pt-12">
        <div className="relative z-10 flex h-14 items-center shrink-0 pr-6">
          <div className="flex items-center gap-0 pl-[42px]">
            <img src="https://storage.googleapis.com/pipelight-assets/logo-256.png" alt="Pipelight" width={40} height={40} className="rounded-lg shrink-0" />
            <img src="https://storage.googleapis.com/pipelight-assets/logo-title.png" alt="Pipelight" height={108} className="h-[108px] w-auto" />
          </div>
          <button
            onClick={() => setChatOpen(true)}
            className="group relative ml-auto flex cursor-pointer items-center gap-2 text-sm text-[#B3B1B6]"
          >
            <span className="relative shimmer-text">Chat with your data</span>
            <SparklesIcon className="relative size-4 text-blue-400 fill-none animate-sparkle-pulse" />
          </button>
          {/* <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-20 w-3/5 rounded-full bg-gradient-to-l from-blue-400/4 via-purple-400/2 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-20 w-2/5 rounded-full bg-gradient-to-l from-blue-400/20 via-purple-400/10 to-transparent blur-2xl" /> */}
        </div>
        <div className="relative z-10 flex flex-1 min-h-0">
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
        </div>
      </div>
    </SidebarProvider>
  );
}
