'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardStats } from '@/lib/types';
import { X } from 'lucide-react';

interface Props {
  nudge: DashboardStats['nudge'] | null;
}

export function NudgeCard({ nudge }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  if (!nudge || !isVisible) {
    return (
      <div
        className="rounded-xl p-5 flex flex-col gap-4 transition-all relative"
        style={{
          background: 'var(--cp-accent-glow)',
          border: '1px solid var(--cp-border-accent)',
          borderLeft: '3px solid var(--cp-border-accent)',
        }}
      >
        <div className="flex gap-3 items-center text-sm font-semibold" style={{ color: 'var(--cp-text-muted)' }}>
          <span className="text-lg leading-none">🤖</span>
          <p>No new nudges at this time. We'll let you know when we find something!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all relative"
      style={{
        background: 'var(--cp-accent-glow)',
        border: '1px solid var(--cp-border-accent)',
        borderLeft: '3px solid var(--cp-accent)',
      }}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--cp-text-muted)' }}
      >
        <X size={16} />
      </button>

      <div className="flex gap-3 items-start">
        <span className="text-lg leading-none mt-0.5">🤖</span>
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-primary)' }}>
            {nudge.copy}
          </p>
          <p className="text-xs" style={{ color: 'var(--cp-text-secondary)' }}>
            {nudge.sub_copy}
          </p>

          {nudge.jobs && nudge.jobs.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5 list-disc pl-4">
              {nudge.jobs.map((job) => (
                <li key={job.job_id} className="job-card__title">
                  {job.job_url ? (
                    <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">
                      {job.title} <span className="job-card__company">@ {job.company}</span>
                    </a>
                  ) : (
                    <>{job.title} <span className="job-card__company">@ {job.company}</span></>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
