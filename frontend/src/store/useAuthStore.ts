import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const getInitialToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cp_token');
    }
    return null;
  };

  const getInitialUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('cp_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const initialToken = getInitialToken();
  const initialUser = getInitialUser();

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    isLoading: false,

    login: (token: string, user: UserProfile) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cp_token', token);
        localStorage.setItem('cp_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cp_token');
        localStorage.removeItem('cp_user');
      }
      set({ token: null, user: null, isAuthenticated: false });
    },

    updateProfile: (profile: Partial<UserProfile>) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, ...profile };
        if (typeof window !== 'undefined') {
          localStorage.setItem('cp_user', JSON.stringify(updated));
        }
        return { user: updated };
      });
    },

    setLoading: (isLoading: boolean) => set({ isLoading }),
  };
});
