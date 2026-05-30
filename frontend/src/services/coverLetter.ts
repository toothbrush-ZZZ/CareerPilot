import { api } from './api';
import { CoverLetterResponse } from '@/types';

export const coverLetterService = {
  generateCoverLetter: async (data: {
    job_description: string;
    company_name: string;
    role_title: string;
    user_name: string;
  }): Promise<CoverLetterResponse> => {
    return api.post<CoverLetterResponse>('/api/v1/cover-letter/generate', data);
  },

  refineCoverLetter: async (data: {
    existing_letter: string;
    feedback: string;
    job_description: string;
  }): Promise<CoverLetterResponse> => {
    return api.post<CoverLetterResponse>('/api/v1/cover-letter/refine', data);
  },
};
