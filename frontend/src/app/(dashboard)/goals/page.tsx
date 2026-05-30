'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';
import { Goal } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  CalendarDays,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function GoalsManager() {
  const queryClient = useQueryClient();
  const [newGoalText, setNewGoalText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // Fetch Goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsService.getGoals,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: goalsService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setNewGoalText('');
      setDueDate('');
      setFormOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: goalsService.toggleGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText || !dueDate) return;

    createMutation.mutate({
      text: newGoalText,
      due_date: dueDate,
    });
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const totalGoalsCount = goals.length;
  const completedCount = completedGoals.length;
  const progressPercent = totalGoalsCount > 0 ? Math.round((completedCount / totalGoalsCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Career Milestones & Goals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Establish targets, schedule due dates, and track achievements.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4 animate-pulse" /> Add New Target
        </button>
      </div>

      {/* Progress banner */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm dark:bg-[#0d1527] dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Milestone Completion Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Complete active items to satisfy AI assistant recommendations and build high-quality application profiles!
            </p>
          </div>
          
          <div className="w-full md:w-72 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Met Targets</span>
              <span className="text-indigo-600 dark:text-indigo-400">{completedCount} of {totalGoalsCount} completed ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible New Goal Form */}
      {formOpen && (
        <div className="p-6 bg-slate-50 border border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800 rounded-2xl shadow-inner max-w-xl animate-fade-in">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-sky-500" /> Define New Goal
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Goal Description *
              </label>
              <input
                type="text"
                required
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Apply to 5 FastAPI backend roles this week"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Due Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newGoalText || !dueDate}
                className="px-5 py-2 text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-sm text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Create Target
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid splits into Active vs Completed list columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ACTIVE GOALS CARD */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-amber-500" /> Active Milestones
            </h3>
            <span className="text-[10px] font-bold py-0.5 px-2 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-full">
              {activeGoals.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const isOverdue = new Date(goal.due_date) < new Date() && !goal.completed;
              
              return (
                <div
                  key={goal.id}
                  onClick={() => handleToggle(goal.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border border-slate-150 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group`}
                >
                  <button className="shrink-0 mt-0.5 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors">
                    <Circle className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white leading-normal">
                      {goal.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold">
                      <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                        <CalendarDays className="h-3.5 w-3.5" /> Due: {formatDate(goal.due_date)}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-0.5 text-rose-500 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {activeGoals.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600 text-sm">
                No pending milestones. Add a new goal to challenge yourself!
              </div>
            )}
          </div>
        </div>

        {/* COMPLETED GOALS CARD */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Completed Achievements
            </h3>
            <span className="text-[10px] font-bold py-0.5 px-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full">
              {completedGoals.length} Met
            </span>
          </div>

          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => handleToggle(goal.id)}
                className="flex items-start gap-4 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group opacity-75 hover:opacity-100"
              >
                <button className="shrink-0 mt-0.5 text-emerald-500 group-hover:text-emerald-600 transition-colors">
                  <CheckCircle2 className="h-5 w-5 fill-emerald-500/10" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 line-through leading-normal group-hover:text-slate-700 dark:group-hover:text-slate-350">
                    {goal.text}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" /> Accomplished (Due: {formatDate(goal.due_date)})
                  </span>
                </div>
              </div>
            ))}

            {completedGoals.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600 text-sm">
                No achievements recorded yet. Get working on those active goals!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
