import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong on our side.";
    
    if (!error.response) {
      message = "Connection issue. Please try again.";
    } else if (error.response.status === 401) {
      // Clear stored token and redirect to login page
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        // Use window.location to force navigation
        window.location.href = '/login';
      }
    } else if (error.response.status === 404) {
      message = "No matching results found.";
    } else if (error.response.status === 422) {
      message = "Please check the highlighted fields.";
    } else if (error.response.data?.detail && typeof error.response.data.detail === 'string') {
      if (!error.response.data.detail.includes('Traceback') && !error.response.data.detail.includes('Error')) {
        message = error.response.data.detail;
      }
    }
    
    error.message = message;
    return Promise.reject(error);
  }
);

import type { Job } from './types';

/** Backend job sources use `role`; UI expects `job_title`. */
export function normalizeJob(job: Record<string, unknown>): Job {
  const title = (job.job_title as string) || (job.role as string) || '';
  return { ...job, job_title: title } as Job;
}

type ProfileUpdatePayload = {
  full_name?: string | null;
  location_city?: string | null;
  location_country?: string | null;
};

export const careerApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: ProfileUpdatePayload) => {
    const payload: ProfileUpdatePayload = {
      full_name: data.full_name ?? undefined,
      location_city: data.location_city ?? undefined,
      location_country: data.location_country ?? undefined,
    };
    return api.post('/profile', payload);
  },
  
  uploadCV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  buildCV: (data: Record<string, unknown>) => api.post('/cv/build', data),
  getCVStatus: () => api.get('/cv/status'),
  
  searchJobs: async (query: string, location?: string) => {
    const res = await api.get('/jobs/search', { params: { query, location } });
    if (res.data?.jobs && Array.isArray(res.data.jobs)) {
      res.data.jobs = res.data.jobs.map((job: Record<string, unknown>) => normalizeJob(job));
    }
    return res;
  },
  manualFit: (jd: string) => api.post('/jobs/manual-fit', { job_description: jd }),
  
  chat: (message: string, sessionId: string) => 
    api.post('/assistant/chat', { message, session_id: sessionId }),
  clearChatSession: (sessionId: string) =>
    api.delete(`/assistant/session/${sessionId}`),
  
  getApplications: () => api.get('/tracker/applications'),
  createApplication: (data: Record<string, unknown>) => api.post('/tracker/applications', data),
  updateApplication: (id: string, data: Record<string, unknown>) => api.patch(`/tracker/applications/${id}`, data),
  deleteApplication: (id: string) => api.delete(`/tracker/applications/${id}`),
  
  getGoals: () => api.get('/tracker/goals'),
  createGoal: (data: Record<string, unknown>) => api.post('/tracker/goals', data),
  toggleGoal: (id: string) => api.patch(`/tracker/goals/${id}/toggle`),
  
  getStats: () => api.get('/dashboard/stats'),
  
  generateCoverLetter: (data: Record<string, unknown>) => api.post('/cover-letter/generate', data),
  refineCoverLetter: (data: Record<string, unknown>) => api.post('/cover-letter/refine', data),
  
  signup: (data: Record<string, unknown>) => api.post('/auth/signup', data),
  login: (data: Record<string, unknown>) => api.post('/auth/login', data),
};
