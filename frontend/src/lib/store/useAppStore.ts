import { create } from 'zustand';
import { User } from '../types';
import { initAuth } from '../utils/api';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  user: User | null;
  setUser: (user: User | null) => void;
  cvUploaded: boolean;
  setCvUploaded: (v: boolean) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  removeToast: (id: string) => void;
  initStore: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  user: {
    id: 'd3b07384-d113-4956-a5cc-9c60dfd2948b', // backend demo user ID
    name: 'Devin Pilot (Demo)',
    email: 'demo@careerpilot.ai'
  },
  setUser: (user) => set({ user }),
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
    await initAuth();
  }
}));
