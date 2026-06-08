import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (token: string, profile: User) => void;
  logout: () => void;
  cvUploaded: boolean;
  setCvUploaded: (v: boolean) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  removeToast: (id: string) => void;
  initStore: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      user: null,
      token: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      isAuthenticated: false,
      login: (token, profile) => {
        import('./useDashboardStore').then(m => m.useDashboardStore.getState().reset?.());
        import('./useTrackerStore').then(m => m.useTrackerStore.getState().reset?.());
        import('./useJobStore').then(m => m.useJobStore.getState().reset?.());
        set({ user: profile, token, isAuthenticated: true, cvUploaded: false });
      },
      logout: () => {
        import('./useDashboardStore').then(m => m.useDashboardStore.getState().reset?.());
        import('./useTrackerStore').then(m => m.useTrackerStore.getState().reset?.());
        import('./useJobStore').then(m => m.useJobStore.getState().reset?.());
        set({ user: null, token: null, isAuthenticated: false, cvUploaded: false });
      },
      cvUploaded: false,
      setCvUploaded: (v) => set({ cvUploaded: v }),
      toasts: [],
      addToast: (toast) => set((state) => ({ 
        toasts: [...state.toasts, { ...toast, id: toast.id || Date.now().toString() }] 
      })),
      removeToast: (id) => set((state) => ({ 
        toasts: state.toasts.filter(t => t.id !== id) 
      })),
      initStore: async () => {
        const { token } = get();
        if (token) {
          const api = await import('../utils/api');
          api.setAuthToken(token);
        }
        try {
          const { getCVStatus } = await import('../utils/api');
          const status = await getCVStatus();
          set({ cvUploaded: status.has_cv });
        } catch {
          // ignore
        }
      }
    }),
    {
      name: 'careerpilot-storage',
      partialize: (state) => ({ theme: state.theme, user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
);
