import { useAuthStore } from '@/store/useAuthStore';

const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : 'http://backend:8000'; // Fallback inside docker network during SSR

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
  bodyData?: any;
  isMultipart?: boolean;
}

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, bodyData, isMultipart, headers: customHeaders, ...rest } = options;

  // Build URL with query parameters
  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryStr = searchParams.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
  }

  // Retrieve token
  let token = useAuthStore.getState().token;
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('cp_token');
  }

  const headers = new Headers(customHeaders);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: any = undefined;
  if (bodyData !== undefined) {
    if (isMultipart) {
      body = bodyData;
      // Note: Fetch sets boundary automatically for FormData, do not set Content-Type manual
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(bodyData);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
    ...rest,
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errRes = await response.json();
      errorDetail = errRes.detail || errRes.message || errorDetail;
    } catch {
      // ignore
    }
    
    // Auto-logout on 401
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number>, options?: Omit<RequestOptions, 'params'>) =>
    apiRequest<T>('GET', path, { params, ...options }),

  post: <T>(path: string, bodyData?: any, options?: Omit<RequestOptions, 'bodyData'>) =>
    apiRequest<T>('POST', path, { bodyData, ...options }),

  put: <T>(path: string, bodyData?: any, options?: Omit<RequestOptions, 'bodyData'>) =>
    apiRequest<T>('PUT', path, { bodyData, ...options }),

  patch: <T>(path: string, bodyData?: any, options?: Omit<RequestOptions, 'bodyData'>) =>
    apiRequest<T>('PATCH', path, { bodyData, ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>('DELETE', path, options),
};
