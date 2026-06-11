"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";

type Status = "pending" | "confirmed" | "cancelled" | "error";

interface ToolCardBaseProps {
  icon: LucideIcon;
  iconColor: string;
  glowColor: string;
  label: string;
  warning?: string;
  error?: string | null;
  onConfirm: (approved: boolean) => void;
  disabled: boolean;
  children?: React.ReactNode;
  renderStatus?: (status: Status) => React.ReactNode | null;
}

export default function ToolCardBase({
  icon: Icon,
  iconColor,
  glowColor,
  label,
  warning,
  error,
  onConfirm,
  disabled,
  children,
  renderStatus,
}: ToolCardBaseProps) {
  const [status, setStatus] = useState<Status>("pending");

  useEffect(() => {
    if (error && status === "confirmed") setStatus("error");
  }, [error, status]);
  const [open, setOpen] = useState(false);

  const handleAction = (approved: boolean) => {
    setStatus(approved ? "confirmed" : "cancelled");
    onConfirm(approved);
  };

  const customStatus = renderStatus?.(status);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card text-sm">
        <div
          className={`pointer-events-none absolute -bottom-6 -right-6 h-32 w-48 rounded-full ${glowColor} blur-3xl`}
        />

        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40">
            <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
            <span className="flex-1 text-sm text-card-foreground">
              AI Assistant wants to{" "}
              <span className="font-semibold">{label}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-4 py-3">
            {warning && (
              <p className="text-sm text-muted-foreground">{warning}</p>
            )}

            {children}

            {status === "pending" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleAction(true)}
                  disabled={disabled}
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleAction(false)}
                  disabled={disabled}
                  className="rounded-md border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {customStatus !== undefined && customStatus !== null
              ? customStatus
              : (
                <>
                  {status === "confirmed" && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                      {disabled && <Loader2 className="h-3 w-3 animate-spin" />}
                      {disabled ? "Executing..." : "Confirmed"}
                    </div>
                  )}

                  {status === "cancelled" && (
                    <p className="text-xs text-muted-foreground">Cancelled</p>
                  )}

                  {status === "error" && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-red-500">{error}</p>
                      <button
                        onClick={() => setStatus("confirmed")}
                        className="rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export type { Status };
