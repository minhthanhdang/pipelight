"use client";

import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConnectCardDialogProps {
  uri: string | null;
  onClose: () => void;
  onCancel?: () => void;
}

export default function ConnectCardDialog({ uri, onClose, onCancel }: ConnectCardDialogProps) {
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === "fivetran:connect-card:close") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <Dialog open={!!uri} onOpenChange={(open) => { if (!open) (onCancel ?? onClose)(); }}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Re-authorize Connector</DialogTitle>
        </DialogHeader>
        {uri && (
          <iframe
            src={uri}
            className="flex-1 w-full border-0"
            allow="clipboard-write"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
