import { create } from 'zustand';
import { JobItem } from '@/types';

interface JobState {
  lastSearchResults: JobItem[];
  savedJobs: JobItem[];
  selectedJob: JobItem | null;
  setLastSearchResults: (results: JobItem[]) => void;
  setSavedJobs: (jobs: JobItem[]) => void;
  setSelectedJob: (job: JobItem | null) => void;
}

export const useJobStore = create<JobState>((set) => ({
  lastSearchResults: [],
  savedJobs: [],
  selectedJob: null,
  setLastSearchResults: (results) => set({ lastSearchResults: results }),
  setSavedJobs: (jobs) => set({ savedJobs: jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
}));
