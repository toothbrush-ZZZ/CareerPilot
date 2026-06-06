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
    ? 'var(--fit-high)'
    : stats.streak >= 3
    ? 'var(--fit-mid)'
    : 'var(--hud-blue)';

  const items = [
    {
      label: 'Streak',
      value: stats.streak,
      suffix: 'd',
      icon: Flame,
      iconColor: '#d97706',
      valueColor: streakColor,
      context: 'days in a row',
      tint: 'stat-amber',
      accentBar: '#d97706',
    },
    {
      label: 'Applications',
      value: stats.applicationsThisWeek,
      suffix: '',
      icon: Send,
      iconColor: '#2563eb',
      valueColor: 'var(--hud-blue)',
      context: 'this week · goal: 5',
      tint: 'stat-blue',
      accentBar: '#2563eb',
    },
    {
      label: 'Skills Added',
      value: stats.skillsAdded,
      suffix: '',
      icon: Zap,
      iconColor: '#7c3aed',
      valueColor: '#7c3aed',
      context: 'from last CV update',
      tint: 'stat-purple',
      accentBar: '#7c3aed',
    },
    {
      label: 'Roadmap',
      value: stats.roadmapPercent,
      suffix: '%',
      icon: Map,
      iconColor: '#059669',
      valueColor: 'var(--fit-high)',
      context: 'of current phase',
      tint: 'stat-green',
      accentBar: '#059669',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`${item.tint} rounded-xl p-4 flex flex-col gap-1.5 card-hover relative overflow-hidden`}
            style={{ border: '1px solid var(--border)' }}
          >
            {/* Subtle top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
              style={{ background: item.accentBar, opacity: 0.7 }}
            />

            <div className="flex items-start justify-between pt-0.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${item.accentBar}18` }}
              >
                <Icon size={13} style={{ color: item.iconColor }} />
              </div>
            </div>

            <span
              className="text-2xl font-mono font-bold leading-tight"
              style={{ color: cvUploaded ? item.valueColor : 'var(--text-muted)' }}
            >
              {!cvUploaded ? '—' : `${item.value}${item.suffix}`}
            </span>

            <span
              className="text-[10px] leading-tight"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.context}
            </span>
          </div>
        );
      })}
    </div>
  );
}
