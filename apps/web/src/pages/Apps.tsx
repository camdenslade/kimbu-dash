import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { api, type App } from '../lib/api';

export function Apps() {
  const qc = useQueryClient();
  const navigate = useNavigate();
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
          <h1 className="text-lg font-semibold">User Pools</h1>
          <p className="text-sm text-muted-foreground">Isolated user directories for your applications</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Pool
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-5 space-y-4 max-w-md">
          <h2 className="text-sm font-medium">Create User Pool</h2>
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
          <p className="text-sm text-muted-foreground">No user pools yet</p>
        ) : (
          apps.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate(`/apps/${app.id}`)}
              className="rounded-lg border bg-card p-4 cursor-pointer hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{app.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                      app.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.description}</p>
                  )}
                  <p className="text-xs font-mono text-muted-foreground mt-1.5 truncate">{app.id}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2 group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex items-center mt-3 pt-3 border-t">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${app.name}"? This cannot be undone.`)) {
                      deleteMutation.mutate(app.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
