import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api, type Session } from '../lib/api';

export function Sessions() {
  const qc = useQueryClient();
  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: api.sessions.list,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.sessions.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Sessions</h1>
        <p className="text-sm text-muted-foreground">{sessions.length} active</p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">IP</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Provider</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Created</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Expires</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No active sessions</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{s.userId?.slice(0, 8) ?? 'N/A'}…</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{s.ipAddress ?? 'N/A'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.deviceType || 'Unknown'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Invalid Date'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : 'Invalid Date'}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => revokeMutation.mutate(s.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
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
