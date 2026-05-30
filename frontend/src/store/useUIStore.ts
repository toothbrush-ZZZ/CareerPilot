import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useUIStore = create<UIState>((set) => {
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cp_theme');
      if (stored) return stored === 'dark';
      // Default to dark mode for a rich premium aesthetic
      return true;
    }
    return true;
  };

  return {
    sidebarOpen: true,
    darkMode: getInitialTheme(),

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (isOpen: boolean) => set({ sidebarOpen: isOpen }),
    toggleDarkMode: () => set((state) => {
      const nextMode = !state.darkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cp_theme', nextMode ? 'dark' : 'light');
        if (nextMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { darkMode: nextMode };
    }),
    setDarkMode: (isDark: boolean) => set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cp_theme', isDark ? 'dark' : 'light');
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { darkMode: isDark };
    }),
  };
});
