import { api } from './api';
import { UserProfile } from '@/types';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/v1/auth/login', { email, password });
  },

  signup: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/v1/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
  },

  getProfile: async (): Promise<UserProfile> => {
    return api.get<UserProfile>('/api/v1/profile');
  },

  updateProfile: async (data: {
    full_name: string;
    location_city: string;
    location_country: string;
    desired_role?: string;
  }): Promise<{ status: string; message: string }> => {
    return api.post<{ status: string; message: string }>('/api/v1/profile', data);
  },
};
