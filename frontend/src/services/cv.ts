import { api } from './api';

interface CVStatusResponse {
  has_cv: boolean;
  chunk_count: number;
  sections: string[];
}

interface CVUploadResponse {
  chunks_stored: number;
  sections: string[];
  extracted_location?: string;
}

export const cvService = {
  getCVStatus: async (): Promise<CVStatusResponse> => {
    return api.get<CVStatusResponse>('/api/v1/cv/status');
  },

  uploadCV: async (file: File): Promise<CVUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<CVUploadResponse>('/api/v1/cv/upload', formData, {
      isMultipart: true,
    });
  },

  buildCV: async (data: {
    name: string;
    summary: string;
    skills: string[];
  }): Promise<CVUploadResponse> => {
    return api.post<CVUploadResponse>('/api/v1/cv/build', data);
  },

  deleteCV: async (): Promise<{ status: string; message: string }> => {
    return api.delete<{ status: string; message: string }>('/api/v1/cv');
  },
};
