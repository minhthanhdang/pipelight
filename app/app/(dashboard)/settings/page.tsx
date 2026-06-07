"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [hasKeys, setHasKeys] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth("/api/settings/fivetran")
      .then((r) => r.json())
      .then((data) => {
        setHasKeys(data.hasKeys ?? false);
        setMaskedKey(data.maskedApiKey ?? null);
      })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetchWithAuth("/api/settings/fivetran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, apiSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setMaskedKey(data.maskedApiKey ?? null);
      setHasKeys(true);
      setApiKey("");
      setApiSecret("");
      setStatus("Credentials saved successfully.");
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetchWithAuth("/api/settings/fivetran", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to remove");
      }
      setMaskedKey(null);
      setHasKeys(false);
      setStatus("Credentials removed.");
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Fivetran Credentials</CardTitle>
          <CardDescription>
            Your API key and secret for Fivetran API access. Keys are encrypted at rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasKeys && maskedKey && (
            <p className="mb-4 text-sm text-muted-foreground">
              Current key: <span className="font-mono">{maskedKey}</span>
            </p>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                className="mt-1"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your Fivetran API key"
              />
            </div>
            <div>
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                className="mt-1"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Your Fivetran API secret"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !apiKey || !apiSecret}>
                {loading ? "Saving..." : "Save"}
              </Button>
              {hasKeys && (
                <Button type="button" variant="outline" onClick={handleRemove} disabled={loading}>
                  Remove
                </Button>
              )}
            </div>
          </form>
          {status && <p className="mt-2 text-sm text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
