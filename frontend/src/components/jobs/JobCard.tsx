'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  ExternalLink,
  Info,
  Check,
  Plus,
  Loader2
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
    description?: string;
  };
  onAnalyze: () => void;
  onAdd: (e: React.MouseEvent) => void;
  isAdded: boolean;
  adding: boolean;
}

export default function JobCard({ job, onAnalyze, onAdd, isAdded, adding }: JobCardProps) {
  const fitPercentage = Math.round((job.fit_score || 0) * 100);
  
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
      className="glass rounded-2xl p-6 group transition-all hover:border-white/10 flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
                <span>{job.location || 'Remote'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <div className={cn(
              "px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 whitespace-nowrap",
              statusColor
            )}>
              <BarChart3 size={14} />
              {fitPercentage}% Fit
            </div>
          </div>
        </div>

        {/* Sneak peek of the fit reasoning if available */}
        {job.description && (
          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="flex gap-2">
          <button 
            onClick={onAnalyze}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/10 transition-all text-xs font-semibold text-white/80"
          >
            <Info size={14} />
            Analyze Fit
          </button>
          {job.job_url && (
            <a 
              href={job.job_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/10 transition-all text-xs font-semibold text-white/80"
            >
              <ExternalLink size={14} />
              View Post
            </a>
          )}
        </div>
        
        <button 
          onClick={onAdd}
          disabled={isAdded || adding}
          className={cn(
            "p-2.5 rounded-xl transition-all",
            isAdded 
              ? "bg-green-600/10 border border-green-600/20 text-green-400 cursor-default" 
              : "bg-blue-600/10 text-blue-400 border border-blue-500/10 hover:bg-blue-600 hover:text-white"
          )}
          title={isAdded ? "Added to Tracker" : "Add to Application Tracker"}
        >
          {adding ? (
            <Loader2 className="animate-spin" size={16} />
          ) : isAdded ? (
            <Check size={16} />
          ) : (
            <Plus size={16} />
          )}
        </button>
      </div>
    </motion.div>
  );
}
