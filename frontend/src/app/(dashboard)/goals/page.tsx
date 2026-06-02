'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  CalendarDays,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox
} from 'lucide-react';

export default function GoalsManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await goalsService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText || !dueDate || isCreating) return;
    setIsCreating(true);
    try {
      await goalsService.createGoal({ text: newGoalText, due_date: dueDate });
      setNewGoalText('');
      setDueDate('');
      setFormOpen(false);
      setSelectedDate(null);
      setSelectedGoals([]);
      await fetchGoals();
    } catch (err) {
      console.error('Error creating goal', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await goalsService.toggleGoal(id);
      setSelectedDate(null);
      setSelectedGoals([]);
      await fetchGoals();
    } catch (err) {
      console.error('Error toggling goal', err);
    }
  };

  // Calendar calculations
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
    setSelectedGoals([]);
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
    setSelectedGoals([]);
  };

  const matchGoalOnDay = (day: number) => {
    const year = currentYear;
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${monthStr}-${dayStr}`;
    return goals.filter(g => g.due_date === targetDateStr && !g.completed);
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
            Milestones & Goals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Set goals, track due dates, and monitor your progress.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 animate-pulse" /> New Goal
        </button>
      </div>

      {/* Progress banner */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm dark:bg-[#0d1527] dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" /> Goal Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Complete your active goals to stay on track.
            </p>
          </div>
          
          <div className="w-full md:w-72 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Goals</span>
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
        <div className="p-6 bg-slate-50 border border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800 rounded-2xl shadow-inner max-w-xl">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-sky-500" /> Create New Goal
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                What is your goal? *
              </label>
              <input
                type="text"
                required
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="e.g., Apply to 5 jobs this week"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newGoalText || !dueDate || isCreating}
                className="px-5 py-2 text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-sm text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid splits into Main list columns vs Side Calendar widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns: Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ACTIVE GOALS CARD */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-500" /> Active Goals
              </h3>
              <span className="text-[10px] font-bold py-0.5 px-2 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-full animate-pulse">
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
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 hover:bg-slate-50 dark:border-slate-800/85 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    <button className="shrink-0 mt-0.5 text-slate-350 dark:text-slate-650 group-hover:text-sky-500 transition-colors">
                      <Circle className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white leading-normal">
                        {goal.text}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-bold">
                        <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          <CalendarDays className="h-3.5 w-3.5" /> Due: {formatDate(goal.due_date)}
                        </span>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-0.5 text-rose-500 dark:text-rose-450">
                            <AlertTriangle className="h-3 w-3 animate-bounce" /> Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeGoals.length === 0 && (
                <div className="py-12 text-center text-slate-400 dark:text-slate-600 text-xs italic font-semibold">
                  No active goals. Add a new goal to get started!
                </div>
              )}
            </div>
          </div>

          {/* COMPLETED GOALS CARD */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Completed Goals
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
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-450 line-through leading-normal group-hover:text-slate-700 dark:group-hover:text-slate-350 font-medium">
                      {goal.text}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" /> Accomplished (Due: {formatDate(goal.due_date)})
                    </span>
                  </div>
                </div>
              ))}

              {completedGoals.length === 0 && (
                <div className="py-12 text-center text-slate-400 dark:text-slate-650 text-xs italic font-semibold">
                  No completed goals yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Calendar Widget + To-Do */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* To-Do Component */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-3 mb-4">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Inbox className="h-4.5 w-4.5 text-purple-500" /> Today's Tasks
              </h3>
              <span className="text-[10px] font-bold py-0.5 px-2 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-full">
                Today
              </span>
            </div>
            
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-900/60 dark:border-slate-850 flex items-start gap-2 text-xs"
                >
                  <Circle className="h-4 w-4 shrink-0 text-slate-450 mt-0.5" />
                  <span className="leading-normal text-slate-750 dark:text-slate-300">{goal.text}</span>
                </div>
              ))}
              {activeGoals.length === 0 && (
                <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900/40 border border-dashed border-slate-150 dark:border-slate-850 text-center text-xs text-slate-400 dark:text-slate-600 font-semibold italic">
                  No tasks for today
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/40 pb-3">
              <h3 className="font-semibold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="h-4.5 w-4.5 text-sky-500" /> Calendar
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 active:scale-90 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-750 dark:text-slate-300">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 active:scale-90 transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            {/* Calendar Day Cells */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
              {/* Padding for first day of month */}
              {[...Array(firstDayIndex)].map((_, idx) => (
                <div key={`pad-${idx}`} className="h-8 w-8" />
              ))}

              {/* Month Days */}
              {[...Array(daysInMonth)].map((_, idx) => {
                const dayNum = idx + 1;
                const dayGoals = matchGoalOnDay(dayNum);
                const hasDeadlines = dayGoals.length > 0;
                
                const isSelected = selectedDate && 
                  selectedDate.getDate() === dayNum && 
                  selectedDate.getMonth() === currentMonth && 
                  selectedDate.getFullYear() === currentYear;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(new Date(currentYear, currentMonth, dayNum));
                      setSelectedGoals(dayGoals);
                    }}
                    className={`h-8 w-8 rounded-lg flex flex-col items-center justify-center relative transition-all active:scale-[0.93] cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                        : hasDeadlines
                        ? 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 dark:text-indigo-400 dark:bg-indigo-500/5'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasDeadlines && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Goals due on selected date list */}
            {selectedDate && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Due on {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {selectedGoals.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleToggle(g.id)}
                        className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-900/60 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer flex items-start gap-2 text-xs text-slate-750 dark:text-slate-300"
                      >
                        <Circle className="h-4 w-4 shrink-0 text-slate-450 mt-0.5 group-hover:text-sky-500" />
                        <span className="leading-normal">{g.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-900/40 border border-dashed border-slate-150 dark:border-slate-850 text-center text-xs text-slate-400 dark:text-slate-600 font-semibold italic flex items-center justify-center gap-1.5">
                    <Inbox className="h-4 w-4 text-slate-300 dark:text-slate-700" /> No goals due on this day.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
