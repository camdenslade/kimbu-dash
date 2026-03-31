import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { Apps } from './pages/Apps';
import { Sessions } from './pages/Sessions';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="kimbu-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route index element={<Overview />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="apps" element={<Apps />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
