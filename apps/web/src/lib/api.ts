const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://kimbu.cslade.space';
const APP_ID = import.meta.env.VITE_APP_ID ?? 'dashboard';

function getToken() {
  return localStorage.getItem('kimbu_access_token');
}

// Transform snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': APP_ID,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  const data = await res.json();
  return toCamelCase(data);
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: User; tokens: Tokens }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<User>('/v1/auth/me'),
    logout: () => request('/v1/auth/logout', { method: 'POST', body: JSON.stringify({}) }),
  },
  users: {
    list: () => request<User[]>('/v1/admin/users'),
    get: (id: string) => request<User>(`/v1/admin/users/${id}`),
    sessions: (id: string) => request<Session[]>(`/v1/admin/users/${id}/sessions`),
    auditLogs: (id: string) => request<AuditLog[]>(`/v1/admin/users/${id}/audit-logs`),
    disable: (id: string) => request(`/v1/admin/users/${id}/disable`, { method: 'POST', body: JSON.stringify({}) }),
    delete: (id: string) => request(`/v1/admin/users/${id}`, { method: 'DELETE' }),
  },
  apps: {
    list: () => request<App[]>('/v1/admin/apps'),
    create: (data: { name: string; description?: string }) =>
      request<App>('/v1/admin/apps', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/v1/admin/apps/${id}`, { method: 'DELETE' }),
  },
  sessions: {
    list: () => request<Session[]>('/v1/admin/sessions'),
    revoke: (id: string) => request(`/v1/admin/sessions/${id}`, { method: 'DELETE' }),
  },
  auditLogs: {
    list: (params?: { limit?: number; offset?: number }) => {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return request<AuditLog[]>(`/v1/admin/audit-logs${qs}`);
    },
  },
  stats: {
    overview: () => request<OverviewStats>('/v1/admin/stats'),
  },
};

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  disabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Session {
  id: string;
  userId: string;
  appId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
  provider?: string; // Derived from deviceType or auth method
}

export interface AuditLog {
  id: string;
  userId?: string;
  eventType: string;
  status: string;
  provider?: string;
  ipAddress?: string;
  failureReason?: string;
  createdAt: string;
}

export interface App {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface OverviewStats {
  totalUsers: number;
  activeSessionsCount: number;
  loginEventsToday: number;
  failedLoginsToday: number;
  newUsersToday: number;
  loginsByDay: { date: string; count: number }[];
}
