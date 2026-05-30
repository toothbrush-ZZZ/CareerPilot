'use client';

import React, { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api';
import JobCard from '@/components/jobs/JobCard';
import { 
  Search, 
  Loader2, 
  Sparkles, 
  Filter, 
  X, 
  ArrowRight,
  Brain,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Job } from '@/lib/types';

export default function JobsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasCV, setHasCV] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [addingToTracker, setAddingToTracker] = useState<string | null>(null);
  const [addedJobs, setAddedJobs] = useState<Record<string, boolean>>({});
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    const checkCV = async () => {
      try {
        const res = await careerApi.getCVStatus();
        setHasCV(res.data.has_cv);
      } catch (err) {
        console.error(err);
      }
    };
    checkCV();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setSearching(true);
    setSearchMessage('');
    try {
      const res = await careerApi.searchJobs(query);
      // The API response contains jobs, message, and location_used
      const jobList = res.data?.jobs || [];
      setJobs(jobList);
      if (res.data?.message) {
        setSearchMessage(res.data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddToTracker = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const jobId = job.job_url || `${job.job_title}-${job.company}`;
    if (addedJobs[jobId] || addingToTracker) return;

    setAddingToTracker(jobId);
    try {
      await careerApi.createApplication({
        job_title: job.job_title,
        company: job.company,
        location: job.location || 'Remote',
        job_url: job.job_url || '',
        status: 'applied',
        notes: `Fit Score: ${Math.round((job.fit_score ?? 0) * 100)}%\nSource: ${job.source || 'Search'}`
      });
      setAddedJobs(prev => ({ ...prev, [jobId]: true }));
    } catch (err) {
      console.error("Failed to add job to tracker", err);
    } finally {
      setAddingToTracker(null);
    }
  };

  const navigateToCoverLetter = (job: Job) => {
    setSelectedJob(null);
    const params = new URLSearchParams({
      role: job.job_title,
      company: job.company,
      desc: job.description || ''
    });
    router.push(`/cover-letter?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Search Header */}
      <div className="glass rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-blue-500/5 rotate-12 pointer-events-none">
          <Sparkles size={200} />
        </div>
        
        <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mb-4">
            Find Your Career Edge
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            AI-powered job hunting that scores every result against your CV for the perfect fit.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative z-10 max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="e.g. Senior React Developer in London or Remote Python Engineer"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={searching}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {searching ? <Loader2 className="animate-spin" size={20} /> : 'Search Opportunities'}
          </button>
        </form>

        {!hasCV && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex items-center justify-center gap-3 max-w-2xl mx-auto cursor-pointer"
            onClick={() => router.push('/cv')}
          >
            <AlertCircle size={18} className="text-amber-400" />
            <span>Upload your CV first to get personalized fit scores! Click here to upload.</span>
          </motion.div>
        )}
      </div>

      {/* Message Banner if returned from search */}
      {searchMessage && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
          {searchMessage}
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Results
            {jobs.length > 0 && <span className="text-white/30 text-sm font-normal">({jobs.length} found)</span>}
          </h2>
          <button className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {jobs.length > 0 ? jobs.map((job, i) => {
              const jobId = job.job_url || `${job.job_title}-${job.company}`;
              const isAdded = !!addedJobs[jobId];
              
              return (
                <JobCard 
                  key={i} 
                  job={job} 
                  onAnalyze={() => setSelectedJob(job)} 
                  onAdd={(e) => handleAddToTracker(job, e)}
                  isAdded={isAdded}
                  adding={addingToTracker === jobId}
                />
              );
            }) : !searching && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/20">
                <Search size={48} className="mb-4" />
                <p className="text-lg">Discover your next role by searching above</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fit Analysis Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="glass max-w-2xl w-full rounded-3xl p-8 space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X size={18} />
              </button>

              {/* Title & Company */}
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI Fit Analysis</span>
                <h3 className="text-2xl font-bold mt-1 text-white">{selectedJob.job_title}</h3>
                <p className="text-white/50 font-medium text-sm">{selectedJob.company} • {selectedJob.location}</p>
              </div>

              {/* Score visual & reasoning */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  {/* Circular indicator */}
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      stroke="#2563eb" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - (selectedJob.fit_score || 0.5))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold text-white">
                    {Math.round((selectedJob.fit_score || 0) * 100)}%
                  </span>
                </div>
                
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Brain className="text-blue-400" size={16} />
                    Fit Overview
                  </h4>
                  <p className="text-sm text-white/70 leading-relaxed mt-1">
                    {selectedJob.fit_reason || "Based on our scoring matrix, this role aligns well with your experience. Expand the sections below to review details."}
                  </p>
                </div>
              </div>

              {/* Score breakdown metrics */}
              {selectedJob.breakdown && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Evaluation Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <BreakdownBar label="Skill Overlap" value={selectedJob.breakdown.skill_overlap} />
                    <BreakdownBar label="Experience Match" value={selectedJob.breakdown.experience_match} />
                    <BreakdownBar label="Keyword Density" value={selectedJob.breakdown.keyword_density} />
                    <BreakdownBar label="Education Match" value={selectedJob.breakdown.education_match} />
                  </div>
                </div>
              )}

              {/* Skills overlap lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 px-1">Matched Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.matched_skills && selectedJob.matched_skills.length > 0 ? (
                      selectedJob.matched_skills.map((s: string) => (
                        <span key={s} className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/30 px-1">No major overlapping skills found</span>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 px-1">Missing Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.missing_skills && selectedJob.missing_skills.length > 0 ? (
                      selectedJob.missing_skills.map((s: string) => (
                        <span key={s} className="text-xs font-semibold px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/30 px-1">None! You are fully qualified! ✨</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="px-5 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => navigateToCoverLetter(selectedJob)}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-500/20"
                >
                  Draft Cover Letter
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string, value: number }) {
  const percentage = Math.round(value * 100);
  return (
    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
      <div className="flex justify-between items-center text-xs font-medium mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
