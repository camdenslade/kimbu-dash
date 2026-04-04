import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Users, Settings, Key, Plus, Shield, RefreshCw, Copy, Check,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { api, type Pool, type PoolUser, type Role } from '../lib/api';

type Tab = 'users' | 'roles' | 'settings' | 'credentials';

export function PoolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('users');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: pool, isLoading } = useQuery<Pool>({
    queryKey: ['pool', id],
    queryFn: () => api.pools.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!pool) return <div className="p-6 text-sm text-muted-foreground">Pool not found</div>;

  function copy(val: string, key: string) {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/apps')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">{pool.name}</h1>
          <p className="text-xs text-muted-foreground font-mono">{pool.id}</p>
        </div>
        <div className="ml-auto flex gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{pool.userCount}</p>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{pool.sessionCount}</p>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'users', label: 'Users', icon: Users },
          { key: 'roles', label: 'Roles', icon: Shield },
          { key: 'settings', label: 'Settings', icon: Settings },
          { key: 'credentials', label: 'API Credentials', icon: Key },
        ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === key
                ? 'border-primary text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab poolId={pool.id} qc={qc} />}
      {tab === 'roles' && <RolesTab poolId={pool.id} qc={qc} />}
      {tab === 'settings' && <SettingsTab pool={pool} qc={qc} />}
      {tab === 'credentials' && <CredentialsTab pool={pool} qc={qc} copy={copy} copiedKey={copiedKey} />}
    </div>
  );
}

// ============================================
// USERS TAB
// ============================================

function UsersTab({ poolId, qc }: { poolId: string; qc: any }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { data: users = [], isLoading } = useQuery<PoolUser[]>({
    queryKey: ['pool-users', poolId],
    queryFn: () => api.pools.users(poolId),
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['pool-roles', poolId],
    queryFn: () => api.pools.roles(poolId),
  });

  const createMutation = useMutation({
    mutationFn: () => api.pools.createUser(poolId, { email, password, name: name || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool-users', poolId] });
      qc.invalidateQueries({ queryKey: ['pool', poolId] });
      setEmail(''); setPassword(''); setName(''); setShowForm(false); setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      api.pools.assignRole(poolId, userId, roleName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pool-users', poolId] }),
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      api.pools.removeRole(poolId, userId, roleName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pool-users', poolId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add User
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-5 space-y-4 max-w-md">
          <h2 className="text-sm font-medium">Add User to Pool</h2>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" />
          </div>
          <div className="space-y-1.5">
            <Label>Name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!email || !password || createMutation.isPending}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users in this pool yet</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Roles</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.membershipId} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.email}</p>
                    {u.name && <p className="text-xs text-muted-foreground">{u.name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {u.status ?? 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {u.roles.map((r) => (
                        <span key={r} className="flex items-center gap-1 text-xs bg-accent px-2 py-0.5 rounded-full">
                          {r}
                          <button
                            onClick={() => removeMutation.mutate({ userId: u.id, roleName: r })}
                            className="hover:text-destructive ml-0.5"
                          >×</button>
                        </span>
                      ))}
                      {roles.filter((r) => !u.roles.includes(r.name)).length > 0 && (
                        <select
                          className="text-xs bg-transparent border rounded px-1 py-0.5 text-muted-foreground"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) assignMutation.mutate({ userId: u.id, roleName: e.target.value });
                            e.target.value = '';
                          }}
                        >
                          <option value="" disabled>+ role</option>
                          {roles.filter((r) => !u.roles.includes(r.name)).map((r) => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================
// ROLES TAB
// ============================================

function RolesTab({ poolId, qc }: { poolId: string; qc: any }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['pool-roles', poolId],
    queryFn: () => api.pools.roles(poolId),
  });

  const createMutation = useMutation({
    mutationFn: () => api.pools.createRole(poolId, { name, description: description || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool-roles', poolId] });
      setName(''); setDescription(''); setShowForm(false);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Role
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-5 space-y-4 max-w-md">
          <h2 className="text-sm font-medium">Create Role</h2>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. editor, viewer" />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this role can do" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>Create</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roles yet</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-4 flex items-start gap-3">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SETTINGS TAB
// ============================================

function SettingsTab({ pool, qc }: { pool: Pool; qc: any }) {
  const cfg = pool.config ?? {};
  const [mfaRequired, setMfaRequired] = useState(cfg.mfaRequired ?? false);
  const [sessionHours, setSessionHours] = useState(String(cfg.sessionDurationHours ?? 24));
  const [minLength, setMinLength] = useState(String(cfg.passwordMinLength ?? 8));
  const [requireUppercase, setRequireUppercase] = useState(cfg.passwordRequireUppercase ?? true);
  const [requireNumbers, setRequireNumbers] = useState(cfg.passwordRequireNumbers ?? true);
  const [requireSymbols, setRequireSymbols] = useState(cfg.passwordRequireSymbols ?? true);
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => api.pools.updateConfig(pool.id, {
      mfaRequired,
      sessionDurationHours: Number(sessionHours),
      passwordMinLength: Number(minLength),
      passwordRequireUppercase: requireUppercase,
      passwordRequireNumbers: requireNumbers,
      passwordRequireSymbols: requireSymbols,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool', pool.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div className="max-w-md space-y-6">
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="text-sm font-medium">Security</h2>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm">Require MFA</p>
            <p className="text-xs text-muted-foreground">All users must set up MFA on next login</p>
          </div>
          <input
            type="checkbox"
            checked={mfaRequired}
            onChange={(e) => setMfaRequired(e.target.checked)}
            className="h-4 w-4"
          />
        </label>
        <div className="space-y-1.5">
          <Label>Session Duration (hours)</Label>
          <Input type="number" value={sessionHours} onChange={(e) => setSessionHours(e.target.value)} min="1" max="720" />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="text-sm font-medium">Password Policy</h2>
        <div className="space-y-1.5">
          <Label>Minimum Length</Label>
          <Input type="number" value={minLength} onChange={(e) => setMinLength(e.target.value)} min="6" max="128" />
        </div>
        {[
          { label: 'Require uppercase', value: requireUppercase, set: setRequireUppercase },
          { label: 'Require numbers', value: requireNumbers, set: setRequireNumbers },
          { label: 'Require symbols', value: requireSymbols, set: setRequireSymbols },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center gap-3">
            <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>

      <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} size="sm">
        {saved ? <><Check className="h-3.5 w-3.5 mr-1.5" />Saved</> : 'Save Changes'}
      </Button>
    </div>
  );
}

// ============================================
// CREDENTIALS TAB
// ============================================

function CredentialsTab({
  pool, qc, copy, copiedKey,
}: {
  pool: Pool;
  qc: any;
  copy: (val: string, key: string) => void;
  copiedKey: string | null;
}) {
  const [confirming, setConfirming] = useState(false);

  const regenMutation = useMutation({
    mutationFn: () => api.pools.regenerateApiKey(pool.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool', pool.id] });
      setConfirming(false);
    },
  });

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">
        Use these credentials to authenticate your app against the Kimbu API.
      </p>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="text-sm font-medium">Pool ID</h2>
        <CopyField label="Pool ID" value={pool.id} fieldKey="id" copy={copy} copiedKey={copiedKey} />

        {pool.apiKey ? (
          <>
            <CopyField label="API Key" value={pool.apiKey} fieldKey="apiKey" copy={copy} copiedKey={copiedKey} />
            <CopyField label="API Secret" value={pool.apiSecret ?? ''} fieldKey="apiSecret" copy={copy} copiedKey={copiedKey} masked />
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No API credentials yet. Generate them below.</p>
        )}
      </div>

      <div className="rounded-lg border border-destructive/30 bg-card p-5 space-y-3">
        <h2 className="text-sm font-medium">Regenerate Credentials</h2>
        <p className="text-xs text-muted-foreground">
          This will invalidate any existing API keys. Apps using the current keys will break immediately.
        </p>
        {!confirming ? (
          <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Regenerate
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => regenMutation.mutate()} disabled={regenMutation.isPending}>
              Confirm Regenerate
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyField({
  label, value, fieldKey, copy, copiedKey, masked,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copy: (val: string, key: string) => void;
  copiedKey: string | null;
  masked?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const display = masked && !revealed ? '••••••••••••••••••••••••' : value;

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono truncate">{display}</code>
        {masked && (
          <button onClick={() => setRevealed(!revealed)} className="text-xs text-muted-foreground hover:text-foreground px-2">
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
        <button onClick={() => copy(value, fieldKey)} className="text-muted-foreground hover:text-foreground">
          {copiedKey === fieldKey ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
