import { api } from './api';
import { JobSearchResponse } from '@/types';

interface FitResponse {
  score: number;
  summary: string;
}

export const jobsService = {
  searchJobs: async (query: string, location?: string, maxResults = 15): Promise<JobSearchResponse> => {
    const params: Record<string, string | number> = { query, max_results: maxResults };
    if (location) {
      params.location = location;
    }
    return api.get<JobSearchResponse>('/api/v1/jobs/search', params);
  },

  getJobsLocation: async (): Promise<{ location: string }> => {
    return api.get<{ location: string }>('/api/v1/jobs/location');
  },

  calculateManualFit: async (jobDescription: string): Promise<FitResponse> => {
    return api.post<FitResponse>('/api/v1/jobs/manual-fit', { job_description: jobDescription });
  },
};
