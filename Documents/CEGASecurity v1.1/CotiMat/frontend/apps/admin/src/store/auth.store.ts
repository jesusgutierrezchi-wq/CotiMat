import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '../types';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  setSession: (token: string, admin: Admin) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setSession: (token, admin) => set({ token, admin }),
      clearSession: () => set({ token: null, admin: null }),
    }),
    {
      name: 'cotimat-admin-auth',
    }
  )
);
