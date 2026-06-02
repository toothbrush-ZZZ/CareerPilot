import { api } from './api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string | null;
  url: string;
  description: string;
  date_posted?: string;
  source?: string;
}

interface JobSearchResponse {
  jobs: Job[];
  count: number;
}

interface FitResponse {
  score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  reasoning?: string;
  error?: string;
}

export const jobsService = {
  searchJobs: async (query: string, location?: string, limit = 10): Promise<JobSearchResponse> => {
    return api.post<JobSearchResponse>('/api/v1/jobs/search', {
      query,
      location: location || 'Dhaka',
      limit
    });
  },

  calculateFit: async (jobTitle: string, company: string, jobDescription: string): Promise<FitResponse> => {
    return api.post<FitResponse>('/api/v1/jobs/compute-fit', {
      job_title: jobTitle,
      company,
      job_description: jobDescription
    });
  },
};
