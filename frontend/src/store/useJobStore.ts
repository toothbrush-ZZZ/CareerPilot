import { create } from 'zustand';
import { JobItem } from '@/types';

interface JobState {
  lastSearchResults: JobItem[];
  lastSearchQuery: string;
  isSearching: boolean;
  searchMessage: string;
  savedJobs: JobItem[];
  selectedJob: JobItem | null;
  setLastSearchResults: (results: JobItem[]) => void;
  setLastSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchMessage: (msg: string) => void;
  setSavedJobs: (jobs: JobItem[]) => void;
  setSelectedJob: (job: JobItem | null) => void;
}

export const useJobStore = create<JobState>((set) => ({
  lastSearchResults: [],
  lastSearchQuery: '',
  isSearching: false,
  searchMessage: '',
  savedJobs: [],
  selectedJob: null,
  setLastSearchResults: (results) => set({ lastSearchResults: results }),
  setLastSearchQuery: (query) => set({ lastSearchQuery: query }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchMessage: (msg) => set({ searchMessage: msg }),
  setSavedJobs: (jobs) => set({ savedJobs: jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
}));
