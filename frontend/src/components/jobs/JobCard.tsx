import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, Calendar, ChevronDown, ChevronUp, ExternalLink, MessageSquare, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/lib/types';
import { FitScore } from '../ui/FitScore';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-[10px] overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--cp-card)',
        border: `0.5px solid ${expanded ? 'var(--cp-border-accent)' : 'var(--cp-border)'}`,
      }}
    >
      
      <div
        className="p-4 flex flex-col gap-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="job-card__title truncate">
                {job.role}
              </h3>
              {job.isNew && (
                <span
                  className="px-[8px] py-[2px] rounded-full text-[10px] font-bold text-white shrink-0"
                  style={{ background: 'var(--cp-accent)' }}
                >
                  New
                </span>
              )}
            </div>
            <div className="job-card__company mt-1">
              {job.company}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <FitScore score={job.fitScore} size={42} showLabel={false} />
            <button
              className="p-1 rounded-md transition-colors"
              style={{ color: 'var(--cp-text-muted)' }}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 mt-1" style={{ borderTop: '1px solid var(--cp-border)' }}>
          <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium" style={{ color: 'var(--cp-text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} style={{ color: 'var(--cp-text-muted)' }} />
              <span>{job.location ? (job.location.toLowerCase().includes('remote') || job.tags.some(t => t.toLowerCase() === 'remote') ? 'Remote' : job.location) : 'Not available'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} style={{ color: 'var(--cp-text-muted)' }} />
              <span>{job.salaryRange || 'Not available'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} style={{ color: 'var(--cp-text-muted)' }} />
              <span>{job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'Deadline: Not available'}</span>
            </div>
          </div>

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[var(--cp-border-accent)] transition-colors hover:bg-[var(--cp-accent-dim)] text-[12px] font-semibold w-full sm:w-auto ${job.applyUrl === '#' ? 'opacity-40 pointer-events-none' : ''}`}
            style={{ color: 'var(--cp-accent)' }}
          >
            Apply <ExternalLink size={13} strokeWidth={2} />
          </a>
        </div>
      </div>

      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-4"
              style={{
                borderTop: '1px solid var(--cp-border)',
                background: 'var(--cp-surface)',
              }}
            >
              <p
                className="text-[11px] font-medium tracking-[-0.01em] mb-2"
                style={{ color: 'var(--cp-text-muted)' }}
              >
                Why this matches your profile
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: 'var(--cp-text-secondary)',
                  borderLeft: `2px solid var(--cp-accent)`,
                  paddingLeft: '12px',
                  opacity: 0.9,
                }}
              >
                {job.fitReason}
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <Link
                  href={`/assistant?job=${encodeURIComponent(job.role)}&company=${encodeURIComponent(job.company)}&action=ask`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                  style={{ background: 'var(--cp-surface)', border: '0.5px solid var(--cp-border)', color: 'var(--cp-text-primary)' }}
                >
                  <MessageSquare size={16} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
                  Ask Assistant
                </Link>
                <Link
                  href={`/assistant?job=${encodeURIComponent(job.role)}&company=${encodeURIComponent(job.company)}&action=cover_letter`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                  style={{ background: 'var(--cp-accent)', color: 'var(--cp-bg)' }}
                >
                  <FileText size={16} strokeWidth={1.5} />
                  Draft Cover Letter
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
