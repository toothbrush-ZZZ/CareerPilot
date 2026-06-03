import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobItem } from '@/types';

interface JobState {
  lastSearchResults: JobItem[];
  lastSearchQuery: string;
  isSearching: boolean;
  hasSearched: boolean;
  searchMessage: string;
  savedJobs: JobItem[];
  selectedJob: JobItem | null;
  setLastSearchResults: (results: JobItem[]) => void;
  setLastSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setSearchMessage: (msg: string) => void;
  setSavedJobs: (jobs: JobItem[]) => void;
  setSelectedJob: (job: JobItem | null) => void;
  clearSearch: () => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      lastSearchResults: [],
      lastSearchQuery: '',
      isSearching: false,
      hasSearched: false,
      searchMessage: '',
      savedJobs: [],
      selectedJob: null,
      setLastSearchResults: (results) => set({ lastSearchResults: results }),
      setLastSearchQuery: (query) => set({ lastSearchQuery: query }),
      setIsSearching: (isSearching) => set({ isSearching }),
      setHasSearched: (hasSearched) => set({ hasSearched }),
      setSearchMessage: (msg) => set({ searchMessage: msg }),
      setSavedJobs: (jobs) => set({ savedJobs: jobs }),
      setSelectedJob: (job) => set({ selectedJob: job }),
      clearSearch: () => set({ lastSearchResults: [], lastSearchQuery: '', hasSearched: false, searchMessage: '' }),
    }),
    {
      name: 'job-storage',
      partialize: (state) => ({ 
        lastSearchResults: state.lastSearchResults, 
        lastSearchQuery: state.lastSearchQuery,
        hasSearched: state.hasSearched,
        savedJobs: state.savedJobs
      }),
    }
  )
);
