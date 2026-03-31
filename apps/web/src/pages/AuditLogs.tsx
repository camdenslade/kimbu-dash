import { useQuery } from '@tanstack/react-query';
import { api, type AuditLog } from '../lib/api';

function Badge({ label, variant }: { label: string; variant: 'success' | 'danger' | 'default' }) {
  const cls = {
    success: 'bg-green-500/10 text-green-600',
    danger: 'bg-red-500/10 text-red-600',
    default: 'bg-muted text-muted-foreground',
  }[variant];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export function AuditLogs() {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: () => api.auditLogs.list({ limit: 100 }),
  });

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">All authentication events</p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Event</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">IP</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No events</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{log.eventType}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      label={log.status}
                      variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'default'}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {log.userId ? `${log.userId.slice(0, 8)}…` : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{log.ipAddress ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Invalid Date'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
