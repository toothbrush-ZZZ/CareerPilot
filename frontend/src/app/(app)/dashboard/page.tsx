'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UploadCloud } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useJobStore } from '@/lib/store/useJobStore';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { NudgeCard } from '@/components/dashboard/NudgeCard';
import { RecentJobs } from '@/components/dashboard/RecentJobs';
import { WeeklyActivity } from '@/components/dashboard/WeeklyActivity';
import { getDashboardStats } from '@/lib/utils/api';
import { DashboardStats } from '@/lib/types';
import { PulseLoader } from '@/components/ui/PulseLoader';

export default function DashboardPage() {
  const { cvUploaded } = useAppStore();
  const { jobs, searchJobs } = useJobStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => {
        console.warn('Failed to load dashboard stats (backend might be offline).');
        setStats({
          streak: 0,
          applicationsThisWeek: 0,
          skillsAdded: 0,
          roadmapPercent: 0,
          weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
        });
      });
  }, []);

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
      className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full custom-scrollbar"
    >
      {hasNudge && stats.nudge && (
        <NudgeCard 
          message={stats.nudge.message}
          linkText={stats.nudge.link_text}
          linkHref={stats.nudge.link_href}
        />
      )}

      {!cvUploaded && (
        <div
          className="rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0"
          style={{
            background: 'var(--cp-accent-glow)',
            border: '1px solid var(--cp-border-accent)',
            borderLeft: '3px solid var(--cp-accent)',
          }}
        >
          <div className="flex items-center gap-3">
            <UploadCloud size={20} className="flex-shrink-0" style={{ color: 'var(--cp-accent)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-primary)' }}>Upload your CV to unlock everything</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cp-text-secondary)' }}>
                Job matching, fit scores, cover letters, and roadmaps are all grounded in your actual profile.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-xs font-semibold hover:underline whitespace-nowrap sm:ml-6 flex items-center gap-1"
            style={{ color: 'var(--cp-accent)' }}
          >
            Upload CV <UploadCloud size={16} />
          </Link>
        </div>
      )}

      <StatsRow stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2">
          <RecentJobs jobs={jobs.slice(0, 3)} />
        </div>
        <div>
          <WeeklyActivity activity={stats.weeklyActivity} />
        </div>
      </div>
    </motion.div>
  );
}
