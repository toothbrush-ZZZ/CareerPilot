import { api } from './api';
import { Goal } from '@/types';

export const goalsService = {
  getGoals: async (): Promise<Goal[]> => {
    return api.get<Goal[]>('/api/v1/tracker/goals');
  },

  createGoal: async (data: { text: string; due_date: string }): Promise<{ status: string }> => {
    return api.post<{ status: string }>('/api/v1/tracker/goals', data);
  },

  toggleGoal: async (id: string): Promise<{ status: string }> => {
    return api.patch<{ status: string }>(`/api/v1/tracker/goals/${id}/toggle`);
  },
};
