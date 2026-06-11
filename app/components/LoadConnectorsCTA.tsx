"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSyncAllConnectors } from "@/hooks/queries";

export function LoadConnectorsCTA() {
  const router = useRouter();
  const syncMutation = useSyncAllConnectors();

  async function handleLoad() {
    await syncMutation.mutateAsync();
    router.push("/connectors");
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <h2 className="text-xl font-semibold">
        Load your connectors to get started
      </h2>
      <p className="text-muted-foreground text-sm">
        Fetch your Fivetran connectors to start monitoring sync health.
      </p>
      <Button onClick={handleLoad} disabled={syncMutation.isPending} className="mt-2">
        {syncMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </>
        ) : (
          "Load Connectors"
        )}
      </Button>
    </div>
  );
}
