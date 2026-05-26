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
      message = "Please sign in again.";
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

export const careerApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.patch('/profile', data),
  
  uploadCV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  buildCV: (data: any) => api.post('/cv/build', data),
  getCVStatus: () => api.get('/cv/status'),
  
  searchJobs: (query: string, location?: string) => 
    api.get('/jobs/search', { params: { query, location } }),
  manualFit: (jd: string) => api.post('/jobs/manual-fit', { job_description: jd }),
  
  chat: (message: string, sessionId: string) => 
    api.post('/assistant/chat', { message, session_id: sessionId }),
  
  getApplications: () => api.get('/tracker/applications'),
  createApplication: (data: any) => api.post('/tracker/applications', data),
  updateApplication: (id: string, data: any) => api.patch(`/tracker/applications/${id}`, data),
  deleteApplication: (id: string) => api.delete(`/tracker/applications/${id}`),
  
  getGoals: () => api.get('/tracker/goals'),
  updateGoal: (id: string, data: any) => api.patch(`/tracker/goals/${id}`, data),
  toggleGoal: (id: string) => api.post(`/tracker/goals/${id}/toggle`),
  
  getStats: () => api.get('/dashboard/stats'),
  
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
};
