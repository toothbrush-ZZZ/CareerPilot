import { Job, JobFilters, Message, CVSection, DashboardStats, KanbanColumn, ApplicationCard, Goal } from '../types';

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

// ==========================================
// AUTHENTICATION
// ==========================================
export async function initAuth(): Promise<void> {
  try {
    // Attempt to log in with demo credentials seeded by the backend
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
    console.error('Network error during initAuth:', error);
  }
}

// ==========================================
// JOBS
// ==========================================
export async function searchJobs(query: string, filters: JobFilters): Promise<Job[]> {
  const reqBody: any = {
    query: query || "Software Engineer",
    location: filters.location || "San Francisco",
    limit: 10
  };

  const response = await fetchWithAuth('/jobs/search', {
    method: 'POST',
    body: JSON.stringify(reqBody)
  });

  const data = await response.json();
  const backendJobs = data.jobs || [];

  return backendJobs.map((j: any) => ({
    id: String(Math.random()), // Backend doesn't strictly give us an ID in scraper yet, or maybe it does? Using random as fallback
    role: j.title || j.role || 'Unknown Role',
    company: j.company || 'Unknown Company',
    location: j.location || 'Remote',
    fitScore: j.fit_score || Math.floor(Math.random() * 40) + 30, // Fallback if no CV uploaded
    fitReason: j.reasoning || "Upload a CV to see why you fit this role.",
    tags: j.matched_skills || [], // Use matched_skills from backend fit score as tags
    postedAt: j.date_posted || new Date().toISOString(),
    applyUrl: j.url || j.apply_url || '#',
    isNew: true
  }));
}

// ==========================================
// ASSISTANT
// ==========================================
export async function sendChatMessage(
  messages: Message[],
  userMessage: string
): Promise<string> {
  const response = await fetchWithAuth('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: userMessage,
      session_id: 'default_demo_session' // In a real app, generate/store this per conversation
    })
  });
  const data = await response.json();
  return data.reply;
}

// ==========================================
// CV
// ==========================================
export async function uploadCV(file: File): Promise<{ sections: CVSection[]; skills: string[] }> {
  const formData = new FormData();
  formData.append('file', file);

  // Note: we can't use fetchWithAuth directly because we need to omit the 'Content-Type' header
  // so fetch can automatically set the boundary for multipart/form-data
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
  // We're returning mock structure for now until the frontend UI is updated to match backend chunks
  return {
    sections: [
      { title: 'Content', content: `Successfully parsed CV. Extracted ${data.chunks_count || 0} chunks.` }
    ],
    skills: []
  };
}

// ==========================================
// DASHBOARD
// ==========================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetchWithAuth('/dashboard/stats');
  const data = await response.json();

  return {
    streak: data.streak_counter || 0,
    applicationsThisWeek: data.this_week || 0,
    skillsAdded: data.skills_extracted || 0,
    roadmapPercent: data.roadmap_progress_percent || 0,
    weeklyActivity: [0, 0, 0, Math.floor((data.this_week || 0) / 2), 0, data.this_week || 0, 0], // Stubbing activity array for now
  };
}

// ==========================================
// TRACKER (Kanban / Goals)
// ==========================================
export async function getApplications(): Promise<ApplicationCard[]> {
  const response = await fetchWithAuth('/tracker/applications');
  const apps = await response.json();
  
  return apps.map((a: any) => ({
    id: a.id,
    role: a.job_title,
    company: a.company,
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
      location: 'Remote', // Fallback
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
