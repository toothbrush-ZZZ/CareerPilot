import type { LucideIcon } from 'lucide-react';

export interface Profile {
  id?: string;
  email?: string;
  full_name?: string | null;
  location_city?: string | null;
  location_country?: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | string;
  content: string;
}

export interface JobBreakdown {
  skill_overlap: number;
  experience_match: number;
  keyword_density: number;
  education_match: number;
}

export interface Job {
  job_title: string;
  company: string;
  location?: string;
  job_url?: string;
  fit_score?: number;
  fit_reason?: string;
  fit_analysis?: Record<string, unknown>;
  breakdown?: JobBreakdown;
  matched_skills?: string[];
  missing_skills?: string[];
  source?: string;
  description?: string;
  role?: string;
}

export interface CVStatus {
  has_cv: boolean;
  chunk_count?: number;
  sections?: string[];
}

export interface Application {
  id: string;
  job_title: string;
  company: string;
  location?: string | null;
  job_url?: string | null;
  status: string;
  notes?: string | null;
  applied_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  text: string;
  due_date?: string | null;
  completed: boolean;
  created_at?: string;
}

export interface DashboardStats {
  total_applications: number;
  this_week: number;
  by_status: Record<string, number>;
  goals_completed: number;
  goals_total: number;
  nudges: string[];
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
}

export interface ApplicationCardProps {
  app: Application;
  onStatusChange: (newStatus: string) => void;
  onDelete: () => void;
}

export interface InputGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}
