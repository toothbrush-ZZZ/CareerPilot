'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  BarChart3, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: {
    job_title: string;
    company: string;
    location: string;
    job_url: string;
    fit_score: number;
    fit_analysis?: any;
    source?: string;
  };
  onAnalyze: () => void;
}

export default function JobCard({ job, onAnalyze }: JobCardProps) {
  const fitPercentage = Math.round(job.fit_score * 100);
  
  const getFitColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 0.5) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const statusColor = getFitColor(job.fit_score);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 group transition-all hover:border-white/10"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {job.job_title}
            </h3>
            {job.source && (
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/5">
                {job.source === 'arbeitnow' ? 'ArbeitNow' : job.source.charAt(0).toUpperCase() + job.source.slice(1)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className={cn(
            "px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 whitespace-nowrap",
            statusColor
          )}>
            <BarChart3 size={14} />
            {fitPercentage}% Fit
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button 
            onClick={onAnalyze}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-xs font-semibold text-white/80"
          >
            <Info size={14} />
            Analyze Fit
          </button>
          <a 
            href={job.job_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-xs font-semibold text-white/80"
          >
            <ExternalLink size={14} />
            View Post
          </a>
        </div>
        <button className="p-2 rounded-xl bg-blue-600/10 text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function Plus({ size, className }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14m-7-7v14" />
    </svg>
  );
}
