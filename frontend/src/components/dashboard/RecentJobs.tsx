import React from 'react';
import Link from 'next/link';
import { Job } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface RecentJobsProps {
  jobs: Job[];
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  return (
    <div
      className="rounded-xl flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Recent Matches
        </h3>
        <Link
          href="/jobs"
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:underline"
          style={{ color: 'var(--hud-blue)' }}
        >
          View All <ExternalLink size={10} />
        </Link>
      </div>

      {/* Job list */}
      <div className="flex flex-col flex-1">
        {jobs.map((job, idx) => (
          <div
            key={job.id}
            className="flex items-center justify-between px-4 py-3.5 transition-colors duration-150 group"
            style={{
              borderBottom: idx < jobs.length - 1 ? '1px solid var(--border)' : undefined,
              cursor: 'default',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-inset)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-sm font-semibold leading-tight truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {job.role}
              </span>
              <span
                className="text-xs truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {job.company}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              {job.deadline && (
                <span
                  className="text-[10px] font-mono uppercase tracking-wider hidden sm:block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {job.deadline}
                </span>
              )}
              <div
                className="w-10 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold"
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  color: 'var(--hud-blue)',
                }}
              >
                {job.fitScore}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
