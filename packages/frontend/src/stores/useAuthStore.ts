import { create } from 'zustand';
import type { User, Role } from '../entities';

const AUTH_STORAGE_KEY = 'academic_user';

const VALID_ROLES: Role[] = ['ADMINISTRATOR', 'STUDENT', 'TEACHER'];

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && VALID_ROLES.includes(value as Role);
}

function getStored(): { user: User | null } {
  if (typeof window === 'undefined') return { user: null };
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null };
    const data = JSON.parse(raw) as User;
    const user = data?.id && isRole(data?.role) ? data : null;
    return { user };
  } catch {
    return { user: null };
  }
}

type AuthState = {
  user: User | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
};

const stored = getStored();

export const useAuthStore = create<AuthState>((set) => ({
  user: stored.user,
  setAuth: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    set({ user });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    set({ user: null });
  },
}));
