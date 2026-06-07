'use client';

import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { SearchX, Bot } from 'lucide-react';
import { SearchBar } from '@/components/jobs/SearchBar';
import { JobCard } from '@/components/jobs/JobCard';
import { SearchLoading } from '@/components/jobs/SearchLoading';
import { useJobStore } from '@/lib/store/useJobStore';

function JobsContent() {
  const { jobs, isSearching, query, setQuery, searchJobs } = useJobStore();
  const params = useSearchParams();
  const initialQuery = params.get('q') ?? '';

  useEffect(() => {
    if (initialQuery && query === '') {
      setQuery(initialQuery);
      searchJobs();
    }
  }, [initialQuery, query, searchJobs, setQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex h-full"
    >
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <SearchBar />

        <div className="flex-1">
          {isSearching ? (
            <SearchLoading />
          ) : (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {jobs.length === 0 ? (
                query ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                    <SearchX size={24} strokeWidth={1.5} className="text-muted" />
                    <p className="text-sm font-semibold text-primary">No jobs found</p>
                    <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                      Try tweaking your search keywords, using a broader title, or expanding the location.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 text-center mt-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center" 
                      style={{ 
                        background: 'var(--cp-surface)', 
                        color: 'var(--cp-accent)',
                        border: '1px solid var(--cp-border)'
                      }}
                    >
                      <Bot size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-wide" style={{ color: 'var(--cp-text-primary)' }}>Your AI Job Hunter is Ready</p>
                      <p className="text-xs mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--cp-text-secondary)' }}>
                        Enter a role or keyword above to initiate the hunt. The agent will fetch live openings and score them instantly against your profile.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><SearchLoading /></div>}>
      <JobsContent />
    </Suspense>
  );
}
