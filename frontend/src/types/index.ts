export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  location_city: string;
  location_country: string;
  desired_role?: string;
}

export interface Application {
  id: string;
  job_title: string;
  company: string;
  location: string;
  job_url: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes: string;
  applied_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  text: string;
  due_date: string;
  completed: boolean;
}

export interface DashboardStats {
  total_applications: number;
  this_week: number;
  by_status: {
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
  };
  goals_total: number;
  goals_completed: number;
  nudge: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface JobItem {
  id?: string;
  job_url?: string;
  url?: string;
  role?: string;
  job_title?: string;
  title?: string;
  company: string;
  location: string;
  description: string;
  salary?: string | null;
  date_posted?: string;
  fit_score?: number;
  fit_percentage?: number;
  fitScore?: number;
  fit_reason?: string;
  fitReason?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  reasoning?: string;
  summary?: string;
  salary_range?: string;
  salaryRange?: string;
  deadline?: string;
  job_type?: string;
  jobType?: string;
  applyUrl?: string;
  source?: string;
}

export interface JobSearchResponse {
  jobs: JobItem[];
  count: number;
}


