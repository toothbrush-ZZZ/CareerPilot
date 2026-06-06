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
    getDashboardStats().then(setStats);
    if (jobs.length === 0) {
      searchJobs();
    }
  }, [jobs.length, searchJobs]);

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <PulseLoader size={60} />
      </div>
    );
  }

  const showNudge = stats.applicationsThisWeek === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {showNudge && (
        <NudgeCard 
          message="You haven't applied this week. 3 matches found for your profile."
          linkText="View Jobs"
          linkHref="/jobs"
        />
      )}

      {!cvUploaded && (
        <div
          className="rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0"
          style={{
            background: 'var(--hud-blue-glow)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderLeft: '3px solid var(--hud-blue)',
          }}
        >
          <div className="flex items-center gap-3">
            <UploadCloud className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--hud-blue)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Upload your CV to unlock everything</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Job matching, fit scores, cover letters, and roadmaps are all grounded in your actual profile.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-xs font-semibold hover:underline whitespace-nowrap sm:ml-6"
            style={{ color: 'var(--hud-blue)' }}
          >
            Upload CV →
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
