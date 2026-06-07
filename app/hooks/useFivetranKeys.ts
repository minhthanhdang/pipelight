"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export function useFivetranKeys() {
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/settings/fivetran")
      .then((r) => r.json())
      .then((data) => setHasKeys(data.hasKeys ?? false))
      .catch(() => setHasKeys(false))
      .finally(() => setLoading(false));
  }, []);

  return { hasKeys, loading };
}
