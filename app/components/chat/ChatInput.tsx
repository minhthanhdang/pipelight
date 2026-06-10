"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wasDisabled = useRef(disabled);

  useEffect(() => {
    if (wasDisabled.current && !disabled) {
      inputRef.current?.focus();
    }
    wasDisabled.current = disabled;
  }, [disabled]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="border-t border-border px-3 py-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder={disabled ? "Agent is thinking…" : "Ask the agent..."}
          disabled={disabled}
          className={`flex-1 text-sm rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
            disabled
              ? "border-2 border-dashed border-muted-foreground/30 opacity-50 cursor-not-allowed"
              : "border-2 border-primary/60"
          }`}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          className="p-2 text-primary hover:bg-accent rounded-lg disabled:opacity-30"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
