import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, Calendar, ChevronDown, ChevronUp, ExternalLink, MessageSquare, FileText } from 'lucide-react';
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
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="text-base font-semibold leading-tight truncate"
                style={{ color: 'var(--cp-text-primary)' }}
              >
                {job.role}
              </h3>
              <div
                className="text-sm mt-0.5"
                style={{ color: 'var(--cp-text-secondary)' }}
              >
                {job.company}
              </div>
            </div>
            {job.isNew && (
              <span
                className="flex-shrink-0 md:hidden px-[10px] py-[3px] rounded-full text-[11px] font-medium text-white"
                style={{ background: 'var(--cp-accent)' }}
              >
                New
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {job.tags.map(tag => (
              <span
                key={tag}
                className="px-[10px] py-[3px] rounded-full text-[11px] font-medium"
                style={{
                  background: 'var(--cp-surface)',
                  border: '0.5px solid var(--cp-border)',
                  color: 'var(--cp-text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        
        <div className="flex flex-row items-center justify-between md:justify-end gap-5 md:w-auto">
          <div className="flex flex-col gap-1.5 text-xs font-mono" style={{ color: 'var(--cp-text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} strokeWidth={1.5} style={{ color: 'var(--cp-text-muted)' }} />
              {job.location}
            </div>
            {job.salaryRange && (
              <div className="flex items-center gap-1.5">
                <DollarSign size={16} strokeWidth={1.5} style={{ color: 'var(--cp-text-muted)' }} />
                {job.salaryRange}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} strokeWidth={1.5} style={{ color: 'var(--cp-text-muted)' }} />
              {job.deadline || 'Rolling'}
            </div>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className={`flex items-center gap-1 text-xs font-semibold hover:underline mt-0.5 ${job.applyUrl === '#' ? 'opacity-40 pointer-events-none' : ''}`}
              style={{ color: 'var(--cp-accent)' }}
            >
              Apply <ExternalLink size={16} strokeWidth={1.5} />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <FitScore score={job.fitScore} size={40} />
            <button
              className="p-1 rounded-md transition-colors"
              style={{ color: 'var(--cp-text-muted)' }}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
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
                  href={`/assistant?job=${encodeURIComponent(job.role)}&company=${encodeURIComponent(job.company)}`}
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
