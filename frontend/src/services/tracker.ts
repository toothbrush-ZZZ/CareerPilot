import { api } from './api';
import { Application } from '@/types';

export const trackerService = {
  getApplications: async (): Promise<Application[]> => {
    return api.get<Application[]>('/api/v1/tracker/applications');
  },

  createApplication: async (data: Omit<Application, 'id'>): Promise<{ status: string; id: string }> => {
    return api.post<{ status: string; id: string }>('/api/v1/tracker/applications', data);
  },

  updateApplication: async (
    id: string,
    data: Partial<Omit<Application, 'id'>>
  ): Promise<{ status: string }> => {
    return api.patch<{ status: string }>(`/api/v1/tracker/applications/${id}`, data);
  },

  deleteApplication: async (id: string): Promise<{ status: string }> => {
    return api.delete<{ status: string }>(`/api/v1/tracker/applications/${id}`);
  },
};
