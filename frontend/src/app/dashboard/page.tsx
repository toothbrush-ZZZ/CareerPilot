'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { careerApi } from '@/lib/api';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Flame, 
  Search,
  Plus,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Stats {
  total_applications: int;
  this_week: int;
  by_status: Record<string, number>;
  goals_completed: int;
  goals_total: int;
  nudges: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await careerApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const statusData = stats ? [
    { name: 'Applied', value: stats.by_status.applied, color: '#3b82f6' },
    { name: 'Interviewing', value: stats.by_status.interviewing, color: '#f59e0b' },
    { name: 'Offer', value: stats.by_status.offer, color: '#22c55e' },
    { name: 'Rejected', value: stats.by_status.rejected, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Dashboard</h1>
          <p className="text-white/50 mt-1">Welcome back. Here's your career progress at a glance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl glass hover:bg-white/5 transition-all text-sm font-medium">
            Search Jobs
          </button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-medium flex items-center gap-2">
            <Plus size={16} />
            New Application
          </button>
        </div>
      </div>

      {/* Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Applications" 
          value={stats?.total_applications || 0} 
          icon={Users} 
          subtitle="All time" 
          trend={`+${stats?.this_week || 0} this week`}
        />
        <StatCard 
          label="Weekly Target" 
          value={`${stats?.this_week || 0}/5`} 
          icon={TrendingUp} 
          subtitle="Progress towards goal" 
          trend={stats?.this_week >= 5 ? "Goal met! ✨" : "3 left to go"}
        />
        <StatCard 
          label="Goal Progress" 
          value={`${stats?.goals_completed || 0}/${stats?.goals_total || 0}`} 
          icon={CheckCircle} 
          subtitle="Tasks completed" 
          trend={`${Math.round((stats?.goals_completed / (stats?.goals_total || 1)) * 100)}% complete`}
        />
        <StatCard 
          label="Day Streak" 
          value="7" 
          icon={Flame} 
          subtitle="Keep it up!" 
          trend="🔥 Fire streak"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="xl:col-span-2 glass rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Application Status</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#111', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {statusData.map(d => (
              <div key={d.name} className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }}></div>
                  <span className="text-sm text-white/50">{d.name}</span>
                </div>
                <span className="text-xl font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nudges */}
        <div className="flex flex-col gap-6">
          <div className="glass rounded-3xl p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">AI Nudges</h3>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="space-y-4">
              {stats?.nudges.length > 0 ? stats.nudges.map((n: string, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 relative group"
                >
                  <p className="text-sm leading-relaxed text-white/80 pr-6">{n}</p>
                  <button className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} className="text-white/30" />
                  </button>
                </motion.div>
              )) : (
                <p className="text-white/30 text-center py-8">No nudges today. You're doing great!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, subtitle, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass rounded-3xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
        <Icon size={120} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/5 text-blue-400">
          <Icon size={24} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-white/50 font-medium">{label}</span>
        <span className="text-3xl font-bold mt-1 tracking-tight">{value}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col">
        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">{trend}</span>
        <span className="text-[10px] text-white/30 mt-1 uppercase tracking-tight">{subtitle}</span>
      </div>
    </motion.div>
  );
}
