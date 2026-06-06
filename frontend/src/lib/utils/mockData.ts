import { Job, Message, Goal, KanbanColumn, DashboardStats } from '../types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    role: 'ML Engineer Intern',
    company: 'Shajgoj',
    location: 'Dhaka, BD',
    salaryRange: 'BDT 15,000–20,000/mo',
    deadline: '2025-07-15',
    fitScore: 87,
    fitReason: 'Strong match: your PyTorch project on sentiment analysis directly aligns with their NLP pipeline. Missing: MLflow experience (mentioned in JD).',
    tags: ['Python', 'PyTorch', 'NLP', 'Internship'],
    postedAt: '2025-06-01',
    applyUrl: '#',
    isNew: true,
  },
  {
    id: '2',
    role: 'Data Scientist',
    company: 'Pathao',
    location: 'Dhaka, BD (Hybrid)',
    salaryRange: 'BDT 60,000–90,000/mo',
    deadline: '2025-06-30',
    fitScore: 92,
    fitReason: 'Excellent match: Requires 1-2 years experience and strong SQL skills. Your recent project with ride-sharing analytics perfectly aligns.',
    tags: ['SQL', 'Machine Learning', 'Python', 'Full-time'],
    postedAt: '2025-06-05',
    applyUrl: '#',
    isNew: true,
  },
  {
    id: '3',
    role: 'AI Research Assistant',
    company: 'BRAC University',
    location: 'Dhaka, BD',
    salaryRange: 'BDT 25,000/mo',
    deadline: '2025-06-20',
    fitScore: 65,
    fitReason: 'Moderate match: Meets research interest, but requires prior publication which is not present in your CV.',
    tags: ['Research', 'Deep Learning', 'TensorFlow', 'Contract'],
    postedAt: '2025-05-28',
    applyUrl: '#',
    isNew: false,
  },
  {
    id: '4',
    role: 'Software Engineer (Data)',
    company: 'Optimizely',
    location: 'Remote',
    salaryRange: '$60k-$80k/yr',
    deadline: '2025-08-01',
    fitScore: 45,
    fitReason: 'Low match: Requires 3+ years in distributed systems (Kafka, Spark) which you lack.',
    tags: ['Data Engineering', 'Kafka', 'Go', 'Full-time'],
    postedAt: '2025-06-02',
    applyUrl: '#',
    isNew: false,
  },
  {
    id: '5',
    role: 'Junior Data Analyst',
    company: 'Daraz',
    location: 'Dhaka, BD',
    salaryRange: 'BDT 35,000–50,000/mo',
    deadline: '2025-07-05',
    fitScore: 78,
    fitReason: 'Good match: Your dashboarding skills (Tableau, PowerBI) match perfectly. They prefer a business degree but your technical skills compensate.',
    tags: ['Data Analysis', 'Tableau', 'SQL', 'Full-time'],
    postedAt: '2025-06-06',
    applyUrl: '#',
    isNew: true,
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'Hello! I am your CareerHUD AI. I have analyzed your profile and I am ready to help you land your next role. What would you like to focus on today?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const MOCK_GOALS: Goal[] = [
  { id: 'g1', text: 'Apply to 5 Data Science roles', target: 5, current: 3, dueDate: '2025-06-14', completed: false, linkedTo: 'jobs' },
  { id: 'g2', text: 'Learn MLflow basics', target: 1, current: 0, dueDate: '2025-06-30', completed: false, linkedTo: 'skills' },
  { id: 'g3', text: 'Update LinkedIn Profile', target: 1, current: 1, dueDate: '2025-06-05', completed: true, linkedTo: 'general' },
];

export const MOCK_KANBAN: KanbanColumn[] = [
  {
    id: 'applied',
    label: 'Applied',
    cards: [
      { id: 'c1', role: 'Data Engineer Intern', company: 'Foodpanda', appliedAt: '2025-06-01', columnId: 'applied' },
      { id: 'c2', role: 'Junior Python Dev', company: 'Brain Station 23', appliedAt: '2025-06-03', columnId: 'applied' }
    ]
  },
  {
    id: 'interviewing',
    label: 'Interviewing',
    cards: [
      { id: 'c3', role: 'Data Analyst', company: 'Chaldal', appliedAt: '2025-05-15', notes: 'Technical interview on Friday', columnId: 'interviewing' }
    ]
  },
  {
    id: 'offer',
    label: 'Offer',
    cards: []
  },
  {
    id: 'rejected',
    label: 'Rejected',
    cards: [
      { id: 'c4', role: 'Machine Learning Engineer', company: 'Telenor', appliedAt: '2025-04-20', notes: 'Needed more experience', columnId: 'rejected' }
    ]
  }
];

export const MOCK_STATS: DashboardStats = {
  streak: 7,
  applicationsThisWeek: 3,
  skillsAdded: 2,
  roadmapPercent: 64,
  weeklyActivity: [1, 0, 2, 1, 3, 0, 1]
};
