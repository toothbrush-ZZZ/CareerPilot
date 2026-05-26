'use client';

import React, { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-amber-500' },
  { id: 'offer', title: 'Offer', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'goals'>('kanban');

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await careerApi.updateApplication(appId, { status: newStatus });
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
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

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Application Tracker</h1>
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
            Kanban Board
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
                    />
                  ))}
                  <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-white/20 hover:text-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} />
                    <span className="text-sm font-medium">Add Job</span>
                  </button>
                </div>
              </div>
            ))}
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
                <button className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all">
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
                          <Calendar size={12} />
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
    </div>
  );
}

function ApplicationCard({ app, onStatusChange }: any) {
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
          <Calendar size={10} />
          <span>{new Date(app.applied_at).toLocaleDateString()}</span>
        </div>
        {app.job_url && (
          <a href={app.job_url} target="_blank" className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {showOptions && (
        <div className="absolute top-10 right-2 z-10 glass rounded-xl border border-white/20 p-2 shadow-2xl min-w-[140px] animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] font-bold text-white/30 px-2 py-1 uppercase tracking-widest border-b border-white/5 mb-1">Status</div>
          {COLUMNS.map(col => (
            <button 
              key={col.id}
              onClick={() => { onStatusChange(col.id); setShowOptions(false); }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5",
                app.status === col.id ? "text-blue-400" : "text-white/60"
              )}
            >
              {col.title}
            </button>
          ))}
          <button className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors mt-1 border-t border-white/5 pt-2">
            Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}
