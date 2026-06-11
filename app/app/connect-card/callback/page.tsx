"use client";

export default function ConnectCardCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-lg font-semibold">Authorization Complete</h1>
        <p className="text-sm text-muted-foreground">You can close this tab and click Done in the chat.</p>
      </div>
    </div>
  );
}
