import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, AppWindow } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { api, type App } from '../lib/api';

export function Apps() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: apps = [], isLoading } = useQuery<App[]>({
    queryKey: ['apps'],
    queryFn: api.apps.list,
  });

  const createMutation = useMutation({
    mutationFn: () => api.apps.create({ name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apps'] });
      setName('');
      setDescription('');
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.apps.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apps'] }),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Apps</h1>
          <p className="text-sm text-muted-foreground">Multi-tenant application configurations</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New App
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-5 space-y-4 max-w-md">
          <h2 className="text-sm font-medium">Create App</h2>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : apps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No apps yet</p>
        ) : (
          apps.map((app) => (
            <div key={app.id} className="rounded-lg border bg-card p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AppWindow className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{app.name}</p>
                  {app.description && <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>}
                  <p className="text-xs font-mono text-muted-foreground mt-1">{app.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete "${app.name}"?`)) deleteMutation.mutate(app.id);
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
