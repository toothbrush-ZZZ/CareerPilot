import { create } from 'zustand';
import { DashboardStats } from '../types';
import { getDashboardStats } from '../utils/api';
import { useAppStore } from './useAppStore';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  loadData: (force?: boolean) => Promise<void>;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  isLoading: false,
  reset: () => set({ stats: null, isLoading: false }),

  loadData: async (force = false) => {
    const { stats } = get();
    // Don't show loading spinner if we already have data, unless forced (or even if forced, we might not want to clear data)
    if (!stats) {
      set({ isLoading: true });
    }

    try {
      const freshStats = await getDashboardStats();
      set({ stats: freshStats, isLoading: false });
    } catch (e) {
      console.warn('Failed to load dashboard stats (backend might be offline).');
      if (!stats) {
        // Only set fallback if we have NO data at all
        set({
          stats: {
            total_applications: 0,
            this_week: 0,
            by_status: { applied: 0, interviewing: 0, offer: 0, rejected: 0 },
            goals_total: 0,
            goals_completed: 0,
            roadmap_progress_percent: 0,
            streak_counter: 0,
            skills_added: 0,
            weekly_activity: [0, 0, 0, 0, 0, 0, 0],
            roadmap_percent: 0,
            active_goals: [],
            due_this_week: [],
            nudge: null
          },
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    }
  }
}));
