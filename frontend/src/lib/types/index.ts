export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  cvFileName?: string;
  cvUploadedAt?: string;
}

export interface Job {
  id: string;
  role: string;
  company: string;
  location: string;
  salaryRange?: string;
  deadline?: string; // ISO date string
  fitScore: number; // 0–100
  fitReason: string; // AI explanation
  tags: string[]; // e.g. ["Python", "Remote", "Internship"]
  postedAt: string;
  applyUrl: string;
  isNew?: boolean;
}

export interface JobFilters {
  location?: string;
  jobType?: 'full-time' | 'part-time' | 'internship' | 'contract';
  minFitScore?: number;
  deadlineWithinDays?: number;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export type KanbanColumnId = 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface ApplicationCard {
  id: string;
  role: string;
  company: string;
  location?: string;
  jobUrl?: string;
  appliedAt: string;
  deadline?: string;
  notes?: string;
  interviewDate?: string;
  columnId: KanbanColumnId;
}

export interface KanbanColumn {
  id: KanbanColumnId;
  label: string;
  cards: ApplicationCard[];
}

export interface Goal {
  id: string;
  text: string;
  target: number;
  current: number;
  dueDate?: string;
  completed: boolean;
  linkedTo?: 'jobs' | 'skills' | 'cv' | 'general';
}

export interface DashboardStats {
  total_applications: number;
  this_week: number;
  by_status: Record<string, number>;
  goals_total: number;
  goals_completed: number;
  roadmap_progress_percent: number;
  streak_counter: number;
  skills_added: number;
  weekly_activity: number[]; // 7 values, Mon-Sun
  roadmap_percent: number;
  active_goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    due_date?: string;
  }>;
  due_this_week: Array<{
    id: string;
    type: 'goal' | 'interview' | 'todo';
    title: string;
    date: string;
  }>;
  nudge?: { 
    type: string; 
    copy: string; 
    sub_copy: string; 
    jobs: Array<{ title: string; company: string; job_id: string; job_url?: string }>;
    cta_label: string;
    cta_url: string;
  } | null;
}

export interface Task {
  id: string;
  goal_id: string;
  title: string;
  due_date?: string;
  completed: boolean;
}

export interface CVSection {
  title: string;
  content: string;
}
