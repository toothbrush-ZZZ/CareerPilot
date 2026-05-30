import { api } from './api';
import { DashboardStats } from '@/types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/api/v1/dashboard/stats');
  },
};
