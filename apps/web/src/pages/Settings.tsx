export function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration</p>
      </div>

      <div className="rounded-lg border bg-card divide-y">
        <div className="p-4">
          <p className="text-sm font-medium">API Endpoint</p>
          <p className="text-xs text-muted-foreground mt-0.5">Base URL for the Kimbu auth service</p>
          <p className="text-sm font-mono mt-2 text-primary">{import.meta.env.VITE_API_URL ?? 'https://kimbu.cslade.space'}</p>
        </div>
        <div className="p-4">
          <p className="text-sm font-medium">App ID</p>
          <p className="text-xs text-muted-foreground mt-0.5">Default X-App-Id sent with API requests</p>
          <p className="text-sm font-mono mt-2 text-primary">{import.meta.env.VITE_APP_ID ?? 'dashboard'}</p>
        </div>
        <div className="p-4">
          <p className="text-sm font-medium">Security configuration</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            JWT secrets, session TTL, and CORS origins are managed in AWS Secrets Manager.
          </p>
        </div>
      </div>
    </div>
  );
}
