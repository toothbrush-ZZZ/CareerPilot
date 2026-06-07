import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardStats } from '@/lib/types';
import { motion } from 'framer-motion';

interface Props {
  goals: DashboardStats['active_goals'];
}

export function ActiveGoalsSnapshot({ goals }: Props) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getDayName = (isoString?: string) => {
    if (!isoString) return 'No Date';
    const d = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tmw';
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isOverdue = (isoString?: string) => {
    if (!isoString) return false;
    const d = new Date(isoString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <div className="flex flex-col rounded-xl p-5" style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="section__heading">Goal Progress</h3>
        <button 
          onClick={() => router.push('/dashboard?tab=planner')}
          className="text-xs font-bold hover:underline" 
          style={{ color: 'var(--cp-accent)' }}
        >
          View all →
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <p className="text-sm font-medium" style={{ color: 'var(--cp-text-muted)' }}>
            No active goals —{' '}
            <button onClick={() => router.push('/dashboard?tab=planner')} className="hover:underline" style={{ color: 'var(--cp-accent)' }}>
              Set a goal →
            </button>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((goal) => {
            const overdue = isOverdue(goal.due_date);
            const hasTarget = goal.target > 0;
            const progressPercent = hasTarget ? Math.min(100, Math.max(0, (goal.current / goal.target) * 100)) : 0;
            const progressText = hasTarget ? `${goal.current} of ${goal.target}` : 'In progress';

            return (
              <div 
                key={goal.id} 
                onClick={() => router.push('/dashboard?tab=planner')}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm shrink-0">🎯</span>
                  <span className="goal-card__title truncate group-hover:underline">
                    {goal.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 w-32">
                    <div className="goal-card__progress-bar flex-1 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isMounted ? `${progressPercent}%` : 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="goal-card__progress-fill h-full"
                      />
                    </div>
                    <span className="goal-card__count w-12 text-right whitespace-nowrap">
                      {progressText}
                    </span>
                  </div>

                  <div className="w-20 text-right flex items-center justify-end gap-1">
                    <span 
                      className={`px-2 py-0.5 rounded-md ${overdue ? 'goal-card__due--overdue bg-red-500/10' : 'goal-card__due bg-black/5 dark:bg-white/5'}`}
                    >
                      Due {getDayName(goal.due_date)}
                    </span>
                    {overdue && <span className="text-xs">⚠️</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
