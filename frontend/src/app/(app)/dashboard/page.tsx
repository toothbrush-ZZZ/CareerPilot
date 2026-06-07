'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useJobStore } from '@/lib/store/useJobStore';
import { NudgeCard } from '@/components/dashboard/NudgeCard';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { OverviewStatCards } from '@/components/dashboard/OverviewStatCards';
import { WeeklyActivityChart } from '@/components/dashboard/WeeklyActivityChart';
import { DueThisWeek } from '@/components/dashboard/DueThisWeek';

import { GoalPanel } from '@/components/tracker/GoalPanel';
import { CalendarView } from '@/components/tracker/CalendarView';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { DashboardStats } from '@/lib/types';
import { PulseLoader } from '@/components/ui/PulseLoader';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'overview';
  const { user, cvUploaded } = useAppStore();
  const { jobs } = useJobStore();
  const { stats, loadData } = useDashboardStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <PulseLoader size={60} />
      </div>
    );
  }

  const hasNudge = !!stats.nudge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 max-w-7xl mx-auto flex flex-col gap-6 h-full overflow-hidden"
    >
      <div className="flex items-center gap-6 border-b shrink-0" style={{ borderColor: 'var(--cp-border)' }}>
        {['overview', 'planner'].map(tab => (
          <button
            key={tab}
            onClick={() => router.push(`/dashboard?tab=${tab}`)}
            className="pb-3 text-xs font-semibold uppercase tracking-wider relative transition-colors"
            style={{ color: currentTab === tab ? 'var(--cp-accent)' : 'var(--cp-text-muted)' }}
          >
            {tab}
            {currentTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'var(--cp-accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className={`flex-1 min-h-0 ${currentTab === 'planner' ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
        {currentTab === 'overview' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-0">
            <DashboardGreeting firstName={user?.name?.split(' ')[0] || 'There'} streak={stats.streak_counter || 0} />
            <OverviewStatCards stats={stats} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
              <WeeklyActivityChart activity={stats.weekly_activity || [0,0,0,0,0,0,0]} />
              <DueThisWeek items={stats.due_this_week || []} />
            </div>

            <div className="flex flex-col gap-2">
              <NudgeCard nudge={stats.nudge} />
            </div>

          </div>
        )}

        {currentTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full min-h-0">
            <div className="lg:col-span-3 h-full overflow-hidden flex flex-col min-h-0">
              <GoalPanel />
            </div>
            <div className="lg:col-span-2 h-full overflow-visible relative z-10 flex flex-col min-h-0">
              <CalendarView />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><PulseLoader size={60} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
