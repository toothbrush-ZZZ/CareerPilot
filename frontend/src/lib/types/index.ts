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
  streak: number;
  applicationsThisWeek: number;
  skillsAdded: number;
  roadmapPercent: number;
  weeklyActivity: number[]; // 7 values, one per day
  nudge?: { message: string; link_text: string; link_href: string } | null;
}

export interface CVSection {
  title: string;
  content: string;
}
