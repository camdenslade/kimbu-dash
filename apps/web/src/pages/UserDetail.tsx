import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MonitorSmartphone, ScrollText, CheckCircle, XCircle, Trash2, Ban } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { api, type User, type Session, type AuditLog } from '../lib/api';

function Badge({ label, variant }: { label: string; variant: 'success' | 'danger' | 'default' }) {
  const cls = {
    success: 'bg-green-500/10 text-green-600',
    danger: 'bg-red-500/10 text-red-600',
    default: 'bg-muted text-muted-foreground',
  }[variant];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => api.users.get(id!),
    enabled: !!id,
  });

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ['users', id, 'sessions'],
    queryFn: () => api.users.sessions(id!),
    enabled: !!id,
  });

  const { data: logs = [] } = useQuery<AuditLog[]>({
    queryKey: ['users', id, 'audit-logs'],
    queryFn: () => api.users.auditLogs(id!),
    enabled: !!id,
  });

  const disableMutation = useMutation({
    mutationFn: () => api.users.disable(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.users.delete(id!),
    onSuccess: () => navigate('/users'),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!user) return <div className="p-6 text-sm text-muted-foreground">User not found</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Users
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {(user.name ?? user.email ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{user.name ?? '—'}</h1>
            <p className="text-sm text-muted-foreground">{user.email ?? user.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => disableMutation.mutate()}
            disabled={disableMutation.isPending}
          >
            <Ban className="h-3.5 w-3.5 mr-1.5" />
            {user.disabled ? 'Enable' : 'Disable'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Delete this user permanently?')) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-5">
        <div>
          <p className="text-xs text-muted-foreground">User ID</p>
          <p className="text-sm font-mono mt-0.5">{user.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-0.5">
            {user.disabled ? <Badge label="Disabled" variant="danger" /> : <Badge label="Active" variant="success" />}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email verified</p>
          <div className="mt-1">
            {user.emailVerified
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <XCircle className="h-4 w-4 text-muted-foreground/50" />}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Phone verified</p>
          <div className="mt-1">
            {user.phoneVerified
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <XCircle className="h-4 w-4 text-muted-foreground/50" />}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Joined</p>
          <p className="text-sm mt-0.5">{new Date(user.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Active Sessions ({sessions.length})</h2>
        </div>
        <div className="rounded-lg border overflow-hidden">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No active sessions</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">IP</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Created</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Expires</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs">{s.ipAddress}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.provider}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{new Date(s.expiresAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Audit Log</h2>
        </div>
        <div className="rounded-lg border overflow-hidden">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No events</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Event</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">IP</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs">{log.eventType}</td>
                    <td className="px-4 py-2.5">
                      <Badge
                        label={log.status}
                        variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'default'}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{log.ipAddress ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
