import { api } from './api';

interface ChatResponse {
  reply: string;
  session_id: string;
}

export const assistantService = {
  chat: async (
    message: string,
    sessionId: string,
    jobTitle?: string,
    jobDescription?: string
  ): Promise<ChatResponse> => {
    return api.post<ChatResponse>('/api/v1/assistant/chat', {
      message,
      session_id: sessionId,
      job_title: jobTitle,
      job_description: jobDescription
    });
  },

  clearSession: async (sessionId: string): Promise<{ cleared: boolean }> => {
    return api.delete<{ cleared: boolean }>(`/api/v1/assistant/session/${sessionId}`);
  },
};
