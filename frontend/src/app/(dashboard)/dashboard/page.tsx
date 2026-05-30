'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import {
  TrendingUp,
  Briefcase,
  Target,
  Award,
  Sparkles,
  RefreshCw,
  Bell,
  PieChart as PieIcon,
  BarChart4
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export default function DashboardOverview() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-rose-500 font-semibold mb-4">Failed to load dashboard metrics.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold text-white bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  // Prepping chart data
  const statusData = [
    { name: 'Applied', value: stats.by_status.applied || 0, color: '#3b82f6' },
    { name: 'Interviewing', value: stats.by_status.interviewing || 0, color: '#a855f7' },
    { name: 'Offer Received', value: stats.by_status.offer || 0, color: '#10b981' },
    { name: 'Rejected', value: stats.by_status.rejected || 0, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  const goalsData = [
    { name: 'Total', count: stats.goals_total || 0, color: '#6366f1' },
    { name: 'Completed', count: stats.goals_completed || 0, color: '#10b981' },
    { name: 'Pending', count: (stats.goals_total - stats.goals_completed) || 0, color: '#f59e0b' },
  ];

  // Calculate percentages
  const completedGoalsPercent = stats.goals_total > 0
    ? Math.round((stats.goals_completed / stats.goals_total) * 100)
    : 0;

  const activeApplications = stats.by_status.applied + stats.by_status.interviewing;

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Overview Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Real-time analytics and intelligent career recommendations.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="self-start sm:self-auto flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-[#0d1527] dark:border-slate-800 dark:hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing Stats...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Applications */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d1527] dark:border-slate-800/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Tracked
            </span>
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-slate-800 dark:text-slate-100 mt-4">
            {stats.total_applications}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            {activeApplications} active submissions
          </p>
        </div>

        {/* Card 2: Weekly Applications */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d1527] dark:border-slate-800/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Submitted This Week
            </span>
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-slate-800 dark:text-slate-100 mt-4">
            {stats.this_week}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Keep up the search pace!
          </p>
        </div>

        {/* Card 3: Goals Completed */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d1527] dark:border-slate-800/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Goal Milestones
            </span>
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
              <Target className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-slate-800 dark:text-slate-100 mt-4">
            {completedGoalsPercent}%
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            {stats.goals_completed} of {stats.goals_total} targets met
          </p>
        </div>

        {/* Card 4: Success Ratio */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d1527] dark:border-slate-800/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Interview Ratio
            </span>
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
              <Award className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-3xl text-slate-800 dark:text-slate-100 mt-4">
            {stats.total_applications > 0
              ? Math.round(((stats.by_status.interviewing + stats.by_status.offer) / stats.total_applications) * 100)
              : 0}%
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Interviewing & offer rates
          </p>
        </div>

      </div>

      {/* Main Charts & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recharts Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Card */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-6">
              <PieIcon className="h-5 w-5 text-sky-500" />
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Application Pipeline Split
              </h3>
            </div>
            
            <div className="h-80 w-full">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">No applications active currently</p>
                </div>
              )}
            </div>
          </div>

          {/* Goal Milestones bar chart */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-6">
              <BarChart4 className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Goal Milestones Stats
              </h3>
            </div>
            
            <div className="h-64 w-full">
              {stats.goals_total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0b0f19', border: 'none', color: '#fff' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {goalsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">No active goals listed</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: AI Nudges Column */}
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-900 via-[#0d1527] to-[#090e1b] border border-slate-800 rounded-2xl relative overflow-hidden">
            {/* Glowing background */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sky-500/10 blur-xl animate-pulse" />
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Sparkles className="h-5 w-5 text-sky-400 animate-pulse" />
              <h3 className="font-semibold text-base text-white">
                AI Career Nudges
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-semibold leading-relaxed">
              Intelligent suggestions parsed contextually from your resume match logs and tracker pipeline.
            </p>

            <div className="space-y-3.5 relative z-10">
              {stats.nudges && stats.nudges.length > 0 ? (
                stats.nudges.map((nudge, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80"
                  >
                    <Bell className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                    <p className="text-xs font-semibold text-slate-200 leading-normal">{nudge}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">No active nudges. Good work!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Start Card */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
              Demo Helper Quick Links
            </h3>
            <div className="space-y-2 text-xs font-bold">
              <a href="/jobs" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors">
                🔍 Live Job Scraper & Fit Test
              </a>
              <a href="/assistant" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors">
                💬 Conversational Career Assistant
              </a>
              <a href="/cover-letter" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors">
                ✍️ Write Custom AI Cover Letters
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
