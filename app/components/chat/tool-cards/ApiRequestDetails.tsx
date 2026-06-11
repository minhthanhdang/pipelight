interface ApiRequestDetailsProps {
  method?: string;
  url?: string;
  body?: Record<string, unknown>;
}

export default function ApiRequestDetails({ method, url, body }: ApiRequestDetailsProps) {
  return (
    <>
      {method && url && (
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-card-foreground">
            {method}
          </code>
          <code className="truncate font-mono text-xs text-muted-foreground">
            {url}
          </code>
        </div>
      )}

      {body && Object.keys(body).length > 0 && (
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs text-muted-foreground">
          {JSON.stringify(body, null, 2)}
        </pre>
      )}
    </>
  );
}
