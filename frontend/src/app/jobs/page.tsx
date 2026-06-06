'use client';

import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { SearchBar } from '@/components/jobs/SearchBar';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
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
    } else if (!query && jobs.length === 0 && !initialQuery) {
      searchJobs();
    }
  }, [initialQuery, query, jobs.length, searchJobs, setQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex h-full"
    >
      {/* Filters Sidebar */}
      <div className="w-60 border-r border-panel-border bg-panel flex-shrink-0 p-6 hidden md:block overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">Filters</h2>
        <JobFilters />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
        <SearchBar />

        <div className="flex-1">
          {isSearching ? (
            <SearchLoading />
          ) : (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {jobs.length === 0 && query ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <SearchX className="w-8 h-8 text-muted" />
                  <p className="text-sm font-semibold text-primary">No matches found</p>
                  <p className="text-xs text-muted max-w-xs">
                    Try broadening your search — remove location constraints or use a different role title.
                  </p>
                </div>
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
