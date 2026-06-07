import React from 'react';
import { TrendingUp, FileText, CheckCircle, Flame, ArrowRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DashboardStats } from '@/lib/types';

interface Props {
  stats: DashboardStats;
}

export function OverviewStatCards({ stats }: Props) {
  const router = useRouter();

  const cards = [
    {
      title: 'Applications Sent',
      value: stats.this_week,
      trend: stats.this_week > 0 ? (
        <span className="flex items-center gap-1"><TrendingUp size={12} /> {stats.this_week} this week</span>
      ) : 'No apps this week',
      trendColor: stats.this_week > 0 ? '#10B981' : 'var(--cp-text-muted)',
      onClick: () => router.push('/tracker'),
      accent: '#3b82f6',
      icon: <FileText size={18} className="text-blue-500 opacity-80" />
    },
    {
      title: 'Skills Added',
      value: stats.skills_added,
      trend: stats.skills_added > 0 ? (
        <span className="flex items-center gap-1"><TrendingUp size={12} /> {stats.skills_added} this week</span>
      ) : (
        <span className="flex items-center gap-1">0 — Add skills <ArrowRight size={12} /></span>
      ),
      trendColor: stats.skills_added > 0 ? '#10B981' : 'var(--cp-text-muted)',
      onClick: () => router.push('/profile'),
      accent: '#eab308',
      icon: <Award size={18} className="text-yellow-500 opacity-80" />
    },
    {
      title: 'Roadmap Complete',
      value: `${stats.roadmap_progress_percent}%`,
      trend: stats.roadmap_progress_percent > 0 ? (
        <span className="flex items-center gap-1"><TrendingUp size={12} /> this week</span>
      ) : (
        <span className="flex items-center gap-1">0% — Start roadmap <ArrowRight size={12} /></span>
      ),
      trendColor: stats.roadmap_progress_percent > 0 ? '#10B981' : 'var(--cp-text-muted)',
      onClick: () => router.push('/dashboard?tab=planner'),
      accent: '#8b5cf6',
      icon: <CheckCircle size={18} className="text-purple-500 opacity-80" />
    },
    {
      title: 'Day Streak',
      value: stats.streak_counter > 0 ? stats.streak_counter : '0',
      trend: stats.streak_counter > 0 ? 'Keep it up!' : '0 days — start today!',
      trendColor: stats.streak_counter > 0 ? '#F97316' : 'var(--cp-text-muted)',
      onClick: () => {},
      accent: '#F97316',
      icon: <Flame size={18} className={stats.streak_counter > 0 ? "text-orange-500" : "text-gray-500 opacity-50"} />
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          onClick={card.onClick}
          className="rounded-xl p-5 cursor-pointer flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
          style={{
            background: 'var(--cp-card)',
            border: '1px solid var(--cp-border)',
          }}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-1" 
            style={{ background: card.accent }} 
          />
          <div className="pl-2 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--cp-text-muted)' }}>
                {card.title}
                {card.title === 'Roadmap Complete'}
              </h3>
              {card.icon}
            </div>
            <div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--cp-text-primary)' }}>
                {card.value}
              </div>
              <div className="text-xs font-medium" style={{ color: card.trendColor }}>
                {card.trend}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
