'use client';

import React, { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Plus, 
  ExternalLink,
  Loader2,
  X,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/tracker/Calendar';
import type { Application, ApplicationCardProps, Goal } from '@/lib/types';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-amber-500' },
  { id: 'offer', title: 'Offer', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'goals' | 'calendar'>('kanban');

  // Modals state
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  
  // New Job state
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');
  const [newJobStatus, setNewJobStatus] = useState('applied');
  const [newJobNotes, setNewJobNotes] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);

  // New Goal state
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  const [submittingGoal, setSubmittingGoal] = useState(false);

  const fetchData = async () => {
    try {
      const [appRes, goalRes] = await Promise.all([
        careerApi.getApplications(),
        careerApi.getGoals()
      ]);
      setApplications(appRes.data);
      setGoals(goalRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    initData();
  }, []);

  const updateStatus = async (appId: string, newStatus: string, oldStatus: string) => {
    try {
      await careerApi.updateApplication(appId, { status: newStatus });
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error(err);
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: oldStatus } : a));
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    try {
      await careerApi.deleteApplication(appId);
      setApplications(apps => apps.filter(a => a.id !== appId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleGoal = async (goalId: string) => {
    try {
      await careerApi.toggleGoal(goalId);
      setGoals(gs => gs.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany) return;

    setSubmittingJob(true);
    try {
      await careerApi.createApplication({
        job_title: newJobTitle,
        company: newJobCompany,
        location: newJobLocation || 'Remote',
        job_url: newJobUrl || '',
        status: newJobStatus,
        notes: newJobNotes || ''
      });
      
      // Reset form
      setNewJobTitle('');
      setNewJobCompany('');
      setNewJobLocation('');
      setNewJobUrl('');
      setNewJobStatus('applied');
      setNewJobNotes('');
      setShowAddJobModal(false);
      
      // Refresh list
      await fetchData();
    } catch (err) {
      console.error("Failed to create application", err);
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    setSubmittingGoal(true);
    try {
      await careerApi.createGoal({
        text: newGoalText,
        due_date: newGoalDueDate ? newGoalDueDate : null
      });

      setNewGoalText('');
      setNewGoalDueDate('');
      setShowAddGoalModal(false);

      await fetchData();
    } catch (err) {
      console.error("Failed to create goal", err);
    } finally {
      setSubmittingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-white/40 animate-pulse font-medium">Loading your career roadmap...</p>
      </div>
    );
  }

  const deadlines = [
    ...applications
      .filter((a): a is Application & { applied_at: string } => Boolean(a.applied_at))
      .map((a) => ({
        date: a.applied_at,
        title: `Applied to ${a.company}`,
        color: 'bg-blue-500',
      })),
    ...goals
      .filter((g): g is Goal & { due_date: string } => Boolean(g.due_date))
      .map((g) => ({
        date: g.due_date,
        title: g.text,
        color: g.completed ? 'bg-green-500' : 'bg-amber-500',
      })),
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Productivity Tracker</h1>
          <p className="text-white/50 mt-1">Manage your job search pipeline and career goals.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'kanban' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/50 hover:text-white"
            )}
          >
            Kanban
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'calendar' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/50 hover:text-white"
            )}
          >
            Calendar
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'goals' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/50 hover:text-white"
            )}
          >
            Goals
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'kanban' ? (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"
          >
            {COLUMNS.map(col => (
              <div key={col.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", col.color)}></div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-white/70">{col.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                    {applications.filter(a => a.status === col.id).length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 min-h-[200px]">
                  {applications.filter(a => a.status === col.id).map(app => (
                    <ApplicationCard 
                      key={app.id} 
                      app={app} 
                      onStatusChange={(status: string) => updateStatus(app.id, status)} 
                      onDelete={() => deleteApplication(app.id)}
                    />
                  ))}
                  {col.id === 'applied' && (
                    <button 
                      onClick={() => { setNewJobStatus('applied'); setShowAddJobModal(true); }}
                      className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-white/20 hover:text-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      <span className="text-sm font-medium">Add Job</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeTab === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto"
          >
            <Calendar deadlines={deadlines} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4">Upcoming Deadlines</h4>
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                  {deadlines.length > 0 ? deadlines.slice(0, 8).map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", d.color)}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white/80">{d.title}</span>
                        <span className="text-[10px] text-white/30">{new Date(d.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-white/20">No deadlines found.</p>
                  )}
                </div>
              </div>
              <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <CalendarIcon className="text-blue-500/20 mb-4" size={48} />
                <p className="text-sm text-white/50">Stay on top of your application deadlines and career milestones.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <div className="glass rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Your Career Goals</h3>
                <button 
                  onClick={() => setShowAddGoalModal(true)}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                {goals.length > 0 ? goals.map((goal, i) => (
                  <motion.div 
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                      goal.completed 
                        ? "bg-white/[0.02] border-white/5 text-white/30" 
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/[0.08]"
                    )}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <div className={cn(
                      "flex-shrink-0 transition-colors",
                      goal.completed ? "text-green-500" : "text-white/20 group-hover:text-white/40"
                    )}>
                      {goal.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className="flex-1">
                      <p className={cn("font-medium", goal.completed && "line-through")}>{goal.text}</p>
                      {goal.due_date && (
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] uppercase tracking-widest font-bold">
                          <CalendarIcon size={12} />
                          <span>Due: {goal.due_date}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-white/30 text-center py-12">No goals set yet. Start with something small!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddJobModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full rounded-[2rem] p-8 space-y-6 relative z-10"
            >
              <button onClick={() => setShowAddJobModal(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/40 hover:text-white">
                <X size={18} />
              </button>
              
              <h3 className="text-xl font-bold text-gradient">Track New Application</h3>
              
              <form onSubmit={handleAddJob} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Job Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={newJobTitle} 
                    onChange={e => setNewJobTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                    placeholder="e.g. React Developer"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Company *</label>
                  <input 
                    type="text" 
                    required 
                    value={newJobCompany} 
                    onChange={e => setNewJobCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Location</label>
                    <input 
                      type="text" 
                      value={newJobLocation} 
                      onChange={e => setNewJobLocation(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                      placeholder="e.g. Remote"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Pipeline Stage</label>
                    <select 
                      value={newJobStatus} 
                      onChange={e => setNewJobStatus(e.target.value)}
                      className="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Job Post URL</label>
                  <input 
                    type="url" 
                    value={newJobUrl} 
                    onChange={e => setNewJobUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Notes / Cover Letter Snippet</label>
                  <textarea 
                    value={newJobNotes} 
                    onChange={e => setNewJobNotes(e.target.value)}
                    className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white custom-scrollbar"
                    placeholder="Draft letter, salary details, interview prep notes..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingJob}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
                >
                  {submittingJob ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Add to Tracker
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddGoalModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-sm w-full rounded-[2rem] p-8 space-y-6 relative z-10"
            >
              <button onClick={() => setShowAddGoalModal(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/40 hover:text-white">
                <X size={18} />
              </button>
              
              <h3 className="text-xl font-bold text-gradient">Set Career Goal</h3>
              
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">What do you want to achieve? *</label>
                  <input 
                    type="text" 
                    required 
                    value={newGoalText} 
                    onChange={e => setNewGoalText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                    placeholder="e.g. Finish React roadmap"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Target Due Date</label>
                  <input 
                    type="date" 
                    value={newGoalDueDate} 
                    onChange={e => setNewGoalDueDate(e.target.value)}
                    className="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-white"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingGoal}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
                >
                  {submittingGoal ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplicationCard({ app, onStatusChange, onDelete }: ApplicationCardProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <motion.div 
      layout
      className="glass rounded-2xl p-4 border border-white/5 hover:border-white/20 transition-all group relative cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm leading-tight line-clamp-2">{app.job_title}</h4>
        <button onClick={() => setShowOptions(!showOptions)} className="p-1 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-colors">
          <MoreVertical size={14} />
        </button>
      </div>
      <p className="text-xs text-white/50 mb-4">{app.company}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <CalendarIcon size={10} />
          <span>{app.applied_at ? new Date(app.applied_at + 'T00:00:00').toLocaleDateString() : '—'}</span>
        </div>
        <div className="flex gap-1">
          {app.job_url && (
            <a href={app.job_url} target="_blank" className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {showOptions && (
        <div className="absolute top-10 right-2 z-10 glass rounded-xl border border-white/20 p-2 shadow-2xl min-w-[140px] animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 uppercase tracking-widest border-b border-white/5 mb-1">Status</div>
          {COLUMNS.map(col => (
            <button 
              key={col.id}
              onClick={() => { onStatusChange(col.id, app.status); setShowOptions(false); }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5",
                app.status === col.id ? "text-blue-400" : "text-white/60"
              )}
            >
              {col.title}
            </button>
          ))}
          <button 
            onClick={() => { onDelete(); setShowOptions(false); }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors mt-1 border-t border-white/5 pt-2 flex items-center gap-1.5"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}
