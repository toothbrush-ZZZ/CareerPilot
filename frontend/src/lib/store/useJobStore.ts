import { create } from 'zustand';
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
  setJobs: (jobs: Job[]) => void;
  setIsSearching: (v: boolean) => void;
  setSelectedJob: (job: Job | null) => void;
  setFilters: (f: Partial<JobFilters>) => void;
  searchJobs: () => Promise<void>;
}

export const useJobStore = create<JobState>((set, get) => ({
  query: '',
  jobs: [],
  isSearching: false,
  selectedJob: null,
  filters: {},
  setQuery: (q) => set({ query: q }),
  setJobs: (jobs) => set({ jobs }),
  setIsSearching: (v) => set({ isSearching: v }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
  searchJobs: async () => {
    const { query, filters } = get();
    set({ isSearching: true });
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
}));
