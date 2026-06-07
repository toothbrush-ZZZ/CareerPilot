import { Job, JobFilters, Message, CVSection, DashboardStats, ApplicationCard, Goal } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let currentToken = authToken;
  if (!currentToken) {
    try {
      const { useAppStore } = await import('../store/useAppStore');
      currentToken = useAppStore.getState().token;
      if (currentToken) authToken = currentToken;
    } catch (e) {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    import('../store/useAppStore').then(({ useAppStore }) => {
      useAppStore.getState().logout();
    });
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function initAuth(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@careerpilot.ai',
        password: 'demopassword'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.access_token);
    }
  } catch (error) {
    // Backend not reachable
  }
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },
  signup: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: name }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Signup failed');
    }
    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },
  getProfile: async () => {
    const response = await fetchWithAuth('/profile');
    return await response.json();
  },
  updateProfile: async (data: any) => {
    const response = await fetchWithAuth('/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  changePassword: async (current_password: string, new_password: string) => {
    const response = await fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
    return await response.json();
  },
  deleteAccount: async (password: string) => {
    const response = await fetchWithAuth('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    });
    return await response.json();
  }
};

export async function searchJobs(query: string, filters: JobFilters): Promise<Job[]> {
  const reqBody: any = {
    query: query || "Software Engineer",
    limit: 10
  };
  if (filters && filters.location) {
    reqBody.location = filters.location;
  }

  const response = await fetchWithAuth('/jobs/search', {
    method: 'POST',
    body: JSON.stringify(reqBody)
  });

  const data = await response.json();
  const backendJobs = data.jobs || [];

  return backendJobs.map((j: any) => ({
    id: String(j.id), 
    role: j.title || j.role || '',
    company: j.company || '',
    location: j.location || '',
    salaryRange: j.salary || '',
    fitScore: j.fit_score || 0,
    fitReason: j.reasoning || '',
    tags: j.matched_skills || [],
    postedAt: j.date_posted || '',
    applyUrl: j.url || j.apply_url || '',
    isNew: false
  }));
}

export async function sendChatMessage(
  messages: Message[],
  userMessage: string,
  sessionId: string,
  jobTitle?: string,
  jobCompany?: string
): Promise<string> {
  const response = await fetchWithAuth('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: userMessage,
      session_id: sessionId,
      job_title: jobTitle ? `${jobTitle} at ${jobCompany || 'Unknown'}` : undefined
    })
  });
  const data = await response.json();
  return data.reply;
}

export async function clearChatSession(sessionId: string): Promise<void> {
  await fetchWithAuth(`/assistant/session/${sessionId}`, {
    method: 'DELETE'
  });
}

export async function uploadCV(file: File): Promise<{ sections: CVSection[]; skills: string[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/cv/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('CV upload failed');
  }

  const data = await response.json();
  return {
    sections: [
      { title: 'Content', content: `Successfully parsed CV. Extracted ${data.chunks_stored || 0} chunks.` }
    ],
    skills: []
  };
}

export async function getCVStatus(): Promise<{ has_cv: boolean; chunk_count: number }> {
  const response = await fetchWithAuth('/cv/status');
  if (!response.ok) return { has_cv: false, chunk_count: 0 };
  return await response.json();
}

export async function deleteCV(): Promise<void> {
  await fetchWithAuth('/cv', {
    method: 'DELETE'
  });
}

export async function buildCV(data: Record<string, any>): Promise<any> {
  const response = await fetchWithAuth('/cv/build', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to build CV');
  return await response.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetchWithAuth('/dashboard/stats');
  const data = await response.json();

  return {
    ...data,
    // Ensure numeric defaults for all stats fields in case backend omits them
    streak_counter: data.streak_counter ?? 0,
    this_week: data.this_week ?? 0,
    skills_added: data.skills_added ?? 0,
    roadmap_progress_percent: data.roadmap_progress_percent ?? 0,
    roadmap_percent: data.roadmap_percent ?? 0,
    weekly_activity: data.weekly_activity ?? [],
    active_goals: data.active_goals ?? [],
    due_this_week: data.due_this_week ?? [],
    nudge: data.nudge ?? null,
  };
}

export async function getApplications(): Promise<ApplicationCard[]> {
  const response = await fetchWithAuth('/tracker/applications');
  const apps = await response.json();
  
  return apps.map((a: any) => ({
    id: a.id,
    role: a.job_title,
    company: a.company,
    location: a.location,
    jobUrl: a.job_url,
    appliedAt: a.applied_at || new Date().toISOString(),
    notes: a.notes,
    interviewDate: a.interview_date,
    columnId: a.status as 'applied' | 'interviewing' | 'offer' | 'rejected'
  }));
}

export async function createApplication(card: Omit<ApplicationCard, 'id'>): Promise<string> {
  const response = await fetchWithAuth('/tracker/applications', {
    method: 'POST',
    body: JSON.stringify({
      job_title: card.role,
      company: card.company,
      location: card.location || 'Remote',
      job_url: card.jobUrl || '',
      status: card.columnId,
      notes: card.notes || '',
      interview_date: card.interviewDate || null
    })
  });
  const data = await response.json();
  return data.id;
}

export async function updateApplicationStatus(id: string, status: string): Promise<void> {
  await fetchWithAuth(`/tracker/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function deleteApplication(id: string): Promise<void> {
  await fetchWithAuth(`/tracker/applications/${id}`, {
    method: 'DELETE'
  });
}

export async function getGoals(): Promise<Goal[]> {
  const response = await fetchWithAuth('/tracker/goals');
  const goals = await response.json();
  
  return goals.map((g: any) => ({
    id: g.id,
    text: g.text,
    target: 1, // simplified
    current: g.completed ? 1 : 0,
    completed: g.completed,
    dueDate: g.due_date,
    linkedTo: 'general'
  }));
}

export async function createGoal(goal: Omit<Goal, 'id'>): Promise<string> {
  const response = await fetchWithAuth('/tracker/goals', {
    method: 'POST',
    body: JSON.stringify({
      text: goal.text,
      due_date: goal.dueDate || null,
    })
  });
  const data = await response.json();
  return data.id;
}

export async function toggleGoalCompletion(id: string): Promise<void> {
  await fetchWithAuth(`/tracker/goals/${id}/toggle`, {
    method: 'PATCH'
  });
}

export async function deleteGoal(id: string): Promise<void> {
  await fetchWithAuth(`/tracker/goals/${id}`, {
    method: 'DELETE'
  });
}
