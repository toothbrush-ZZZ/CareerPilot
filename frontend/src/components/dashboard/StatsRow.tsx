import React from 'react';
import { Flame, Send, Zap, Map } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { useAppStore } from '@/lib/store/useAppStore';

interface StatsRowProps {
  stats: DashboardStats;
}

export function StatsRow({ stats }: StatsRowProps) {
  const { cvUploaded } = useAppStore();

  const streakColor = stats.streak >= 7
    ? 'var(--cp-accent)'
    : stats.streak >= 3
    ? 'var(--cp-gold)'
    : 'var(--cp-accent)';

  const items = [
    {
      label: 'Streak',
      value: stats.streak,
      suffix: ' days',
      icon: Flame,
      iconColor: 'var(--cp-gold)',
      valueColor: streakColor,
      context: 'in a row',
      tint: 'stat-amber',
      accentBar: 'var(--cp-gold)',
    },
    {
      label: 'Applications',
      value: stats.applicationsThisWeek,
      suffix: '',
      icon: Send,
      iconColor: 'var(--cp-accent)',
      valueColor: 'var(--cp-accent)',
      context: 'sent this week (goal: 5)',
      tint: 'stat-blue',
      accentBar: 'var(--cp-accent)',
    },
    {
      label: 'Skills added',
      value: stats.skillsAdded,
      suffix: '',
      icon: Zap,
      iconColor: 'var(--cp-text-secondary)',
      valueColor: 'var(--cp-text-secondary)',
      context: 'from your last CV update',
      tint: 'stat-purple',
      accentBar: 'var(--cp-text-secondary)',
    },
    {
      label: 'Roadmap progress',
      value: stats.roadmapPercent,
      suffix: '%',
      icon: Map,
      iconColor: 'var(--cp-accent)',
      valueColor: 'var(--cp-accent)',
      context: 'completed for this phase',
      tint: 'stat-green',
      accentBar: 'var(--cp-accent)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`${item.tint} rounded-[10px] p-4 flex flex-col gap-1.5 relative overflow-hidden`}
            style={{ border: '1px solid var(--cp-border)' }}
          >
            
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
              style={{ background: item.accentBar, opacity: 0.7 }}
            />

            <div className="flex items-start justify-between pt-0.5">
              <span
                className="text-[11px] font-medium tracking-[-0.01em]"
                style={{ color: 'var(--cp-text-muted)' }}
              >
                {item.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--cp-surface)' }}
              >
                <Icon size={20} strokeWidth={1.5} style={{ color: item.iconColor }} />
              </div>
            </div>

            <span
              className="text-2xl  font-bold leading-tight"
              style={{ color: cvUploaded ? item.valueColor : 'var(--cp-text-muted)' }}
            >
              {!cvUploaded ? '—' : `${item.value}${item.suffix}`}
            </span>

            <span
              className="text-[10px] leading-tight"
              style={{ color: 'var(--cp-text-muted)' }}
            >
              {item.context}
            </span>
          </div>
        );
      })}
    </div>
  );
}
