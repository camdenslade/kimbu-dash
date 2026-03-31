import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tokens } from '../lib/api';

interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  setAuth: (user: User, tokens: Tokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => {
        localStorage.setItem('kimbu_access_token', tokens.accessToken);
        set({ user, tokens });
      },
      clearAuth: () => {
        localStorage.removeItem('kimbu_access_token');
        set({ user: null, tokens: null });
      },
    }),
    { name: 'kimbu-auth' }
  )
);
