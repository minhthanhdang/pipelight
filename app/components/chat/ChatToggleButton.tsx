"use client";

import { MessageCircle } from "lucide-react";
import { useAIStore } from "@/stores/useAIStore";

export default function ChatToggleButton({ visible }: { visible: boolean }) {
  const setChatOpen = useAIStore((s) => s.setChatOpen);

  if (!visible) return null;

  return (
    <button
      onClick={() => setChatOpen(true)}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
}
