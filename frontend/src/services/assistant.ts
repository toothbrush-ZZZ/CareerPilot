import { api } from './api';
import { ChatMessage } from '@/types';

interface ChatResponse {
  response: string;
  session_id: string;
  history: ChatMessage[];
}

export const assistantService = {
  chat: async (
    message: string,
    sessionId: string,
    lastSearchResults?: any[],
    selectedJob?: any | null
  ): Promise<ChatResponse> => {
    return api.post<ChatResponse>('/api/v1/assistant/chat', {
      message,
      session_id: sessionId,
      last_search_results: lastSearchResults,
      selected_job: selectedJob
    });
  },

  clearSession: async (sessionId: string): Promise<{ status: string }> => {
    return api.delete<{ status: string }>(`/api/v1/assistant/session/${sessionId}`);
  },
};
