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
      className="rounded-[10px] flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--cp-card)', border: '0.5px solid var(--cp-border)' }}
    >
      
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--cp-border)' }}
      >
        <h3
          className="text-[11px] font-medium tracking-[-0.01em]"
          style={{ color: 'var(--cp-text-muted)' }}
        >
          Recent matches
        </h3>
        <Link
          href="/jobs"
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:underline"
          style={{ color: 'var(--cp-accent)' }}
        >
          View all <ExternalLink size={16} strokeWidth={1.5} />
        </Link>
      </div>

      
      <div className="flex flex-col flex-1">
        {jobs.map((job, idx) => (
          <div
            key={job.id}
            className="flex items-center justify-between px-4 py-3.5 transition-colors duration-150 group hover:bg-[var(--cp-surface)]"
            style={{
              borderBottom: idx < jobs.length - 1 ? '1px solid var(--cp-border)' : undefined,
              cursor: 'default',
            }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-sm font-semibold leading-tight truncate"
                style={{ color: 'var(--cp-text-primary)' }}
              >
                {job.role}
              </span>
              <span
                className="text-xs truncate"
                style={{ color: 'var(--cp-text-muted)' }}
              >
                {job.company}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              {job.deadline && (
                <span
                  className="text-[10px] font-mono tracking-wider hidden sm:block"
                  style={{ color: 'var(--cp-text-muted)' }}
                >
                  {job.deadline}
                </span>
              )}
              <div
                className="w-10 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                style={{
                  background: 'var(--cp-surface)',
                  border: '0.5px solid var(--cp-border)',
                  color: 'var(--cp-accent)',
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
