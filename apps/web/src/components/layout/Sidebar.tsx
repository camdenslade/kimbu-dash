import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  AppWindow,
  ScrollText,
  MonitorSmartphone,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/apps', label: 'Apps', icon: AppWindow },
  { to: '/sessions', label: 'Sessions', icon: MonitorSmartphone },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user, clearAuth } = useAuthStore();

  async function handleLogout() {
    await api.auth.logout().catch(() => {});
    clearAuth();
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm tracking-tight">Kimbu</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-4 py-3">
        <p className="text-xs text-muted-foreground truncate mb-2">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
