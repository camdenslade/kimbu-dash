import { useQuery } from '@tanstack/react-query';
import { Users, Activity, ShieldAlert, UserPlus } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api, type OverviewStats } from '../lib/api';

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: number | string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Overview() {
  const { data, isLoading } = useQuery<OverviewStats>({
    queryKey: ['stats'],
    queryFn: api.stats.overview,
  });

  const mockData = data ?? {
    totalUsers: 0,
    activeSessionsCount: 0,
    loginEventsToday: 0,
    failedLoginsToday: 0,
    newUsersToday: 0,
    loginsByDay: [],
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Authentication activity across all apps</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={isLoading ? '—' : mockData.totalUsers} icon={Users} />
        <StatCard label="Active Sessions" value={isLoading ? '—' : mockData.activeSessionsCount} icon={Activity} />
        <StatCard label="Logins Today" value={isLoading ? '—' : mockData.loginEventsToday} icon={Activity} />
        <StatCard label="Failed Logins" value={isLoading ? '—' : mockData.failedLoginsToday} icon={ShieldAlert} sub="Today" />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <p className="text-sm font-medium mb-4">Logins — Last 14 Days</p>
        {mockData.loginsByDay.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockData.loginsByDay}>
              <defs>
                <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#loginGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">New Users Today</p>
        </div>
        <p className="text-3xl font-semibold">{isLoading ? '—' : mockData.newUsersToday}</p>
      </div>
    </div>
  );
}
