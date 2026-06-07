import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardStats } from '@/lib/types';

interface Props {
  items: DashboardStats['due_this_week'];
}

export function DueThisWeek({ items }: Props) {
  const router = useRouter();

  const getDayName = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tmw';

    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isOverdue = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <div className="flex flex-col h-full rounded-xl p-5" style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--cp-text-primary)' }}>This Week</h3>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <p className="text-sm font-medium" style={{ color: '#10B981' }}>Clear week ahead ✅</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.slice(0, 5).map((item, i) => {
            const overdue = isOverdue(item.date);
            const icon = item.type === 'goal' ? '🎯' : item.type === 'interview' ? '💼' : '📋';
            return (
              <button
                key={item.id + i}
                onClick={() => router.push(item.type === 'goal' ? '/dashboard?tab=planner' : '/tracker')}
                className="flex items-center gap-3 w-full text-left p-2 -mx-2 rounded-lg transition-colors hover:bg-black/5"
              >
                <span className="text-sm">
                  {icon}
                </span>
                <span className="text-xs font-bold w-10 shrink-0" style={{ color: overdue ? '#EF4444' : 'var(--cp-text-secondary)' }}>
                  {getDayName(item.date)}
                </span>
                <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--cp-text-primary)' }}>
                  {item.title}
                </span>
                {overdue && <span className="text-xs">⚠️</span>}
              </button>
            );
          })}
          
          {items.length > 5 && (
            <button 
              onClick={() => router.push('/dashboard?tab=planner')}
              className="text-xs font-bold text-left mt-2 hover:underline" 
              style={{ color: 'var(--cp-accent)' }}
            >
              and {items.length - 5} more →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
