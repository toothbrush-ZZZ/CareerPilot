'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs';
import { JobItem } from '@/types';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Percent,
  HelpCircle,
  Cpu,
  BookOpen,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  FlameKindling
} from 'lucide-react';

export default function JobHunter() {
  const [activeTab, setActiveTab] = useState<'board' | 'evaluator'>('board');
  
  // Search parameters
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [expandedJobIndex, setExpandedJobIndex] = useState<number | null>(null);

  // Manual fit form
  const [manualDescription, setManualDescription] = useState('');
  const [manualFitResult, setManualFitResult] = useState<{ score: number; summary: string } | null>(null);

  // Fetch jobs list
  const { data: searchResponse, isLoading: searchLoading, refetch: executeSearch, isRefetching } = useQuery({
    queryKey: ['job-search', query, location],
    queryFn: () => jobsService.searchJobs(query, location),
    enabled: false, // only execute on click
  });

  // Fetch pre-saved user location default
  const { data: userLoc } = useQuery({
    queryKey: ['user-location'],
    queryFn: jobsService.getJobsLocation,
  });

  // Manual fit calculation mutation
  const manualFitMutation = useMutation({
    mutationFn: jobsService.calculateManualFit,
    onSuccess: (data) => {
      setManualFitResult(data);
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setExpandedJobIndex(null);
    executeSearch();
  };

  const handleManualFitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription) return;
    setManualFitResult(null);
    manualFitMutation.mutate(manualDescription);
  };

  const handleUseProfileLocation = () => {
    if (userLoc?.location && userLoc.location !== 'Not set') {
      setLocation(userLoc.location);
    }
  };

  const handleToggleExpand = (index: number) => {
    setExpandedJobIndex(expandedJobIndex === index ? null : index);
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-950';
    if (percent >= 55) return 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-950';
    return 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-950';
  };

  const getScoreBgBar = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 55) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const jobsList = searchResponse?.jobs || [];
  const searchMessage = searchResponse?.message || '';

  return (
    <div className="space-y-8">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Intelligent Job Hunting
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Search live job postings or evaluate custom listings using AI parameters.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('board')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'board'
              ? 'text-sky-500 dark:text-sky-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          🔍 Live Search & AI Match
          {activeTab === 'board' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 dark:bg-sky-400" />}
        </button>

        <button
          onClick={() => setActiveTab('evaluator')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'evaluator'
              ? 'text-indigo-500 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          🧠 Custom Fit Scorer
          {activeTab === 'evaluator' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400" />}
        </button>
      </div>

      {/* TAB 1: LIVE JOB BOARD SEARCH */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          
          {/* Query Search Card */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Keyword */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Title / Keyword *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Briefcase className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Python Developer, Full Stack Engineer"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Location Override
                    </label>
                    {userLoc?.location && userLoc.location !== 'Not set' && (
                      <button
                        type="button"
                        onClick={handleUseProfileLocation}
                        className="text-[10px] font-bold text-sky-500 hover:underline"
                      >
                        Use Profile Default ({userLoc.location})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <MapPin className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote, San Francisco"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                    />
                  </div>
                </div>

              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="submit"
                  disabled={searchLoading || isRefetching || !query}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {searchLoading || isRefetching ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Querying API & Vector Scoring...
                    </>
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5" /> Scrape & Core Score
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Search Results Board */}
          {(searchLoading || isRefetching) && (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Search Message Warning */}
          {searchMessage && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              💡 {searchMessage}
            </div>
          )}

          {/* Job Items List */}
          {!searchLoading && !isRefetching && jobsList.length > 0 && (
            <div className="space-y-4">
              {jobsList.map((job, index) => {
                const isExpanded = expandedJobIndex === index;
                const fitPercent = job.fit_percentage || 50;
                const badgeColor = getScoreColor(fitPercent);
                const barColor = getScoreBgBar(fitPercent);
                
                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-[#0d1527] dark:border-slate-800/80 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    
                    {/* Glowing highlight sidebar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Job details */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 truncate">
                          {job.role || job.job_title || 'Unknown Position'}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.location}
                          </span>
                        </div>
                      </div>

                      {/* AI fit badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`py-1.5 px-3 rounded-xl border text-xs font-extrabold flex items-center gap-1 ${badgeColor}`}>
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                          <span>AI Fit: {fitPercent}%</span>
                        </div>

                        <button
                          onClick={() => handleToggleExpand(index)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 dark:border-slate-850 dark:hover:bg-slate-900 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                    </div>

                    {/* Expandable description and AI Match summary details */}
                    {isExpanded && (
                      <div className="mt-5 border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-4 animate-fade-in text-xs font-semibold text-slate-600 dark:text-slate-300">
                        
                        {/* Match Bar Visualizer */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="uppercase text-[10px] tracking-wider text-slate-400">Match score meter</span>
                            <span className="text-slate-800 dark:text-slate-200">{fitPercent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${fitPercent}%` }} />
                          </div>
                        </div>

                        {/* AI Match Summary */}
                        {job.summary && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 dark:bg-slate-900/60 dark:border-slate-800 flex items-start gap-2.5">
                            <Cpu className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">AI Alignment Analysis</h4>
                              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{job.summary}</p>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider mb-2">Job Description Snapshot</h4>
                          <p className="leading-relaxed whitespace-pre-line line-clamp-6 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-3.5 border border-slate-100 dark:border-slate-800/40 rounded-xl font-medium">
                            {job.description}
                          </p>
                        </div>

                        {/* Link to apply */}
                        <div className="flex justify-end pt-2">
                          <a
                            href={job.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-750 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-slate-700"
                          >
                            Apply Posting <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {!searchLoading && !isRefetching && jobsList.length === 0 && (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400">No Job Searches Queried Yet</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Use the search box above to fetch live jobs and compute compatibility matching.
              </p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CUSTOM FIT EVALUATOR */}
      {activeTab === 'evaluator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PASTE JOB BOX */}
          <div className="lg:col-span-2 p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FlameKindling className="h-5 w-5 text-indigo-500" /> Paste Job Specifications
            </h3>

            <form onSubmit={handleManualFitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Job Description Text *
                </label>
                <textarea
                  required
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  rows={10}
                  placeholder="Paste the full job posting requirements here. Mention languages, libraries, databases, or cloud frameworks..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="submit"
                  disabled={manualFitMutation.isPending || !manualDescription}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {manualFitMutation.isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating Vectors...
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Analyze Match Suitability
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RESULTS GRAPHICAL CIRCLE */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 h-full flex flex-col justify-between">
              
              <div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                  AI Fit Score Report
                </h3>

                {manualFitMutation.isPending && (
                  <div className="py-12 text-center animate-pulse space-y-4">
                    <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  </div>
                )}

                {!manualFitMutation.isPending && manualFitResult && (
                  <div className="space-y-6">
                    
                    {/* Ring scoring indicator */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        {/* Circle meter */}
                        <svg className="w-28 h-28 transform -rotate-90">
                          <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" className="dark:stroke-slate-800" />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={manualFitResult.score >= 0.8 ? '#10b981' : manualFitResult.score >= 0.55 ? '#f59e0b' : '#f43f5e'}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={301.6}
                            strokeDashoffset={301.6 - (301.6 * manualFitResult.score)}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute text-2xl font-extrabold text-slate-800 dark:text-white">
                          {Math.round(manualFitResult.score * 100)}%
                        </span>
                      </div>
                      
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">
                        Resume Suitability Score
                      </span>
                    </div>

                    {/* Summary explanations */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold mb-2">
                        <BookOpen className="h-4 w-4 text-indigo-400" /> AI Score Breakdown
                      </div>
                      <p>{manualFitResult.summary}</p>
                    </div>

                  </div>
                )}

                {!manualFitMutation.isPending && !manualFitResult && (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-600 text-xs italic font-semibold">
                    Paste description specs and compute analysis to view glowing scoring cards here.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
