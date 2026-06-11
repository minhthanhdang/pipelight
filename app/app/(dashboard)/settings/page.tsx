"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFivetranSettings, useSaveFivetranKeys, useRemoveFivetranKeys } from "@/hooks/queries";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const { data: settings } = useFivetranSettings();
  const saveMutation = useSaveFivetranKeys();
  const removeMutation = useRemoveFivetranKeys();

  const loading = saveMutation.isPending || removeMutation.isPending;
  const hasKeys = settings?.hasKeys ?? false;
  const maskedKey = settings?.maskedApiKey ?? null;

  const status = saveMutation.isSuccess
    ? "Credentials saved successfully."
    : removeMutation.isSuccess
      ? "Credentials removed."
      : saveMutation.error?.message ?? removeMutation.error?.message ?? null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await saveMutation.mutateAsync({ apiKey, apiSecret });
    setApiKey("");
    setApiSecret("");
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
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
              {hasKeys && (
                <Button type="button" variant="outline" onClick={() => removeMutation.mutate()} disabled={loading}>
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
