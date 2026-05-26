'use client';

import React, { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api';
import JobCard from '@/components/jobs/JobCard';
import { Search, MapPin, Loader2, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasCV, setHasCV] = useState(false);

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
    if (!query) return;
    
    setSearching(true);
    try {
      const res = await careerApi.searchJobs(query, location);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="glass rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-blue-500/5 rotate-12">
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
              placeholder="Job Title, Keywords, or Company"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Location (e.g. Remote)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              value={location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={searching}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {searching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </form>

        {!hasCV && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex items-center justify-center gap-3 max-w-2xl mx-auto"
          >
            <AlertCircle size={18} />
            Upload your CV first to get personalized fit scores!
          </motion.div>
        )}
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {jobs.length > 0 ? jobs.map((job: any, i) => (
              <JobCard 
                key={i} 
                job={job} 
                onAnalyze={() => console.log('Analyze', job)} 
              />
            )) : !searching && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/20">
                <Search size={48} className="mb-4" />
                <p className="text-lg">Enter a search query to find your next role</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ size, className }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
