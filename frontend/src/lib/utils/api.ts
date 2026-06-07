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
  if (!authToken) {
    console.warn('fetchWithAuth called without authToken. Calling initAuth...');
    await initAuth();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

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
      console.log('Demo user authenticated successfully');
    } else {
      console.error('Failed to auto-login demo user');
    }
  } catch (error) {
    console.warn('Backend not reachable during initAuth (expected if backend is not running).');
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
    if (!response.ok) throw new Error('Failed to get profile');
    return await response.json();
  },
  updateProfile: async (data: any) => {
    const response = await fetchWithAuth('/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  },
  changePassword: async (current_password: string, new_password: string) => {
    const response = await fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
    if (!response.ok) throw new Error('Failed to change password');
    return await response.json();
  },
  deleteAccount: async (password: string) => {
    const response = await fetchWithAuth('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error('Failed to delete account');
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

  return backendJobs.map((j: any, index: number) => ({
    id: j.id ? `${j.id}-${index}` : String(Math.random()), 
    role: j.title || j.role || 'Unknown Role',
    company: j.company || 'Unknown Company',
    location: j.location || 'Remote',
    salaryRange: j.salary,
    fitScore: j.fit_score || Math.floor(Math.random() * 40) + 30, // Fallback if no CV uploaded
    fitReason: j.reasoning || "Upload a CV to see why you fit this role.",
    tags: j.matched_skills || [], // Use matched_skills from backend fit score as tags
    postedAt: j.date_posted || new Date().toISOString(),
    applyUrl: j.url || j.apply_url || '#',
    isNew: true
  }));
}

export async function sendChatMessage(
  messages: Message[],
  userMessage: string,
  jobTitle?: string,
  jobCompany?: string
): Promise<string> {
  const response = await fetchWithAuth('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: userMessage,
      session_id: 'default_demo_session', // In a real app, generate/store this per conversation
      job_title: jobTitle ? `${jobTitle} at ${jobCompany || 'Unknown'}` : undefined
    })
  });
  const data = await response.json();
  return data.reply;
}

export async function clearChatSession(sessionId: string = 'default_demo_session'): Promise<void> {
  await fetchWithAuth(`/assistant/session/${sessionId}`, {
    method: 'DELETE'
  });
}

export async function uploadCV(file: File): Promise<{ sections: CVSection[]; skills: string[] }> {
  const formData = new FormData();
  formData.append('file', file);

  if (!authToken) {
    await initAuth();
  }

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
    streak: data.streak_counter || 0,
    applicationsThisWeek: data.this_week || 0,
    skillsAdded: data.skills_extracted || 0,
    roadmapPercent: data.roadmap_progress_percent || 0,
    weeklyActivity: [0, 0, 0, Math.floor((data.this_week || 0) / 2), 0, data.this_week || 0, 0], // Stubbing activity array for now
    nudge: typeof data.nudge === 'string' ? { 
      message: data.nudge, 
      link_text: "View matching jobs", 
      link_href: "/jobs" 
    } : (data.nudge || null),
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
      notes: card.notes || ''
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
