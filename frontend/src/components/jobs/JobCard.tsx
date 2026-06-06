import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Job } from '@/lib/types';
import { FitScore } from '../ui/FitScore';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{
        background: 'var(--bg-panel)',
        border: `1px solid ${expanded ? 'var(--hud-blue)' : 'var(--border)'}`,
      }}
    >
      {/* Main card row */}
      <div
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Left: role + company + tags */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="text-base font-semibold leading-tight truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {job.role}
              </h3>
              <div
                className="text-sm mt-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {job.company}
              </div>
            </div>
            {job.isNew && (
              <span
                className="flex-shrink-0 md:hidden px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: 'var(--hud-blue)' }}
              >
                New
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {job.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: meta + fit score */}
        <div className="flex flex-row items-center justify-between md:justify-end gap-5 md:w-auto">
          <div className="flex flex-col gap-1.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <MapPin size={11} style={{ color: 'var(--text-muted)' }} />
              {job.location}
            </div>
            {job.salaryRange && (
              <div className="flex items-center gap-1.5">
                <DollarSign size={11} style={{ color: 'var(--text-muted)' }} />
                {job.salaryRange}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
              {job.deadline || 'Rolling'}
            </div>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className={`flex items-center gap-1 text-xs font-semibold hover:underline mt-0.5 ${job.applyUrl === '#' ? 'opacity-40 pointer-events-none' : ''}`}
              style={{ color: 'var(--hud-blue)' }}
            >
              Apply <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <FitScore score={job.fitScore} size={40} />
            <button
              className="p-1 rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
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
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-inset)',
              }}
            >
              <p
                className="text-[10px] font-mono uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Why this matches your profile
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: 'var(--text-secondary)',
                  borderLeft: `2px solid var(--hud-blue)`,
                  paddingLeft: '12px',
                  opacity: 0.9,
                }}
              >
                {job.fitReason}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
