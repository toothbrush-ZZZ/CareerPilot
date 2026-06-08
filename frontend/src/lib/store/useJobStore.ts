import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job, JobFilters } from '../types';
import { searchJobs } from '../utils/api';
import { useAppStore } from './useAppStore';

interface JobState {
  query: string;
  jobs: Job[];
  isSearching: boolean;
  selectedJob: Job | null;
  filters: JobFilters;
  setQuery: (q: string) => void;
  setIsSearching: (v: boolean) => void;
  setSelectedJob: (job: Job | null) => void;
  setFilters: (f: Partial<JobFilters>) => void;
  searchJobs: (force?: boolean) => Promise<void>;
  reset: () => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      query: '',
      jobs: [],
      isSearching: false,
      selectedJob: null,
      filters: {},
      reset: () => set({ query: '', jobs: [], isSearching: false, selectedJob: null, filters: {} }),
      setQuery: (q) => set({ query: q }),
      setIsSearching: (v) => set({ isSearching: v }),
      setSelectedJob: (job) => set({ selectedJob: job }),
      setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
      searchJobs: async (force = false) => {
        const { query, filters, jobs } = get();
        // Only show the full-screen loader if we have NO data
        if (jobs.length === 0) {
          set({ isSearching: true });
        }
        try {
          const results = await searchJobs(query, filters);
          set({ jobs: results });
        } catch {
          useAppStore.getState().addToast({ message: 'Job search failed.', type: 'error' });
          set({ jobs: [] });
        } finally {
          set({ isSearching: false });
        }
      },
    }),
    {
      name: 'careerpilot-jobs-storage',
      partialize: (state) => ({ query: state.query, jobs: state.jobs, filters: state.filters, selectedJob: state.selectedJob })
    }
  )
);
