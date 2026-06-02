'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jobsService } from '@/services/jobs';
import { useJobStore } from '@/store/useJobStore';
import { JobItem } from '@/types';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Cpu,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  FlameKindling,
  Mail,
  Bot
} from 'lucide-react';

export default function JobHunter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'board' | 'evaluator'>('board');
  
  const { 
    lastSearchResults, 
    lastSearchQuery: query, 
    isSearching,
    searchMessage,
    setLastSearchResults, 
    setLastSearchQuery: setQuery,
    setIsSearching,
    setSearchMessage
  } = useJobStore();

  const [expandedJobIndex, setExpandedJobIndex] = useState<number | null>(null);

  // Manual fit form
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualFitLoading, setManualFitLoading] = useState(false);
  const [manualFitResult, setManualFitResult] = useState<{
    score?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    reasoning?: string;
    error?: string;
  } | null>(null);


  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setExpandedJobIndex(null);
    setIsSearching(true);
    setSearchMessage('');
    
    try {
      const response = await jobsService.searchJobs(query);
      setLastSearchResults(response.jobs || []);
    } catch (err) {
      console.error('Error searching jobs', err);
      setSearchMessage('Failed to fetch job postings. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualFitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription || !manualTitle) return;
    setManualFitResult(null);
    setManualFitLoading(true);

    try {
      const data = await jobsService.calculateFit(manualTitle, manualCompany, manualDescription);
      setManualFitResult(data);
    } catch (err) {
      console.error('Error calculating fit', err);
    } finally {
      setManualFitLoading(false);
    }
  };

  const handleToggleExpand = (index: number) => {
    setExpandedJobIndex(expandedJobIndex === index ? null : index);
  };

  const handleDraftCoverLetter = (job: JobItem) => {
    sessionStorage.setItem(
      "pending_assistant_message",
      JSON.stringify({
        message: `Draft a cover letter for the ${job.role || job.title} role at ${job.company}.`,
        job_title: job.role || job.title,
        job_description: job.description,
      })
    );
    router.push('/assistant');
  };

  // Send job context to assistant with a readiness-check message
  const handleAskAssistant = (job: JobItem) => {
    sessionStorage.setItem(
      "pending_assistant_message",
      JSON.stringify({
        message: `Am I a good fit for the ${job.role || job.title} role at ${job.company}? Assess my readiness based on my CV.`,
        job_title: job.role || job.title,
        job_description: job.description,
      })
    );
    router.push('/assistant');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-950';
    if (score >= 55) return 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-950';
    return 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-950';
  };

  const getScoreBgBar = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 55) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Intelligent Job Hunting
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Search for jobs or check your fit for a specific role.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('board')}
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === 'board'
              ? 'text-sky-500 dark:text-sky-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          🔍 Search Jobs
          {activeTab === 'board' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 dark:bg-sky-400" />}
        </button>

        <button
          onClick={() => setActiveTab('evaluator')}
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === 'evaluator'
              ? 'text-indigo-500 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          🧠 Check Job Fit
          {activeTab === 'evaluator' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400" />}
        </button>
      </div>

      {/* TAB 1: LIVE JOB BOARD SEARCH */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          
          {/* Query Search Card */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  What kind of job are you looking for? *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Machine Learning internships in Dhaka"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 pl-10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="submit"
                  disabled={isSearching || !query}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Searching job boards...
                    </>
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5" /> Search Jobs
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Search Results Board */}
          {isSearching && (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Search Message Warning */}
          {searchMessage && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              💡 {searchMessage}
            </div>
          )}

          {/* Job Items List */}
          {!isSearching && lastSearchResults.length > 0 && (
            <div className="space-y-4">
              {lastSearchResults.map((job, index) => {
                const isExpanded = expandedJobIndex === index;
                
                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-[#0d1527] dark:border-slate-800/80 hover:shadow-md transition-all relative overflow-hidden"
                  >
                    
                    {/* Glowing highlight sidebar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Job details */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 truncate">
                          {job.title || job.role || 'Unknown Position'}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          <span className="flex items-center gap-1 text-slate-650 dark:text-slate-300">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            💵 {job.salary || job.salary_range || 'Salary: Not specified'}
                          </span>
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500/90">
                            ⏳ {job.deadline ? `Deadline: ${job.deadline}` : 'Deadline: Not specified'}
                          </span>
                          {job.date_posted && (
                            <span className="flex items-center gap-1">
                              📅 Posted: {job.date_posted}
                            </span>
                          )}
                          {job.source && (
                            <span className="flex items-center gap-1">
                              🌐 Source: {job.source}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {job.fit_score !== undefined && (
                          <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${getScoreColor(job.fit_score)}`}>
                            {job.fit_score}% Fit
                          </div>
                        )}
                        {/* Ask Assistant button */}
                        <button
                          onClick={() => handleAskAssistant(job)}
                          className="py-1.5 px-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 hover:bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70 transition-all flex items-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                        >
                          <Bot className="h-3.5 w-3.5 text-indigo-500" /> Ask Assistant
                        </button>

                        <button
                          onClick={() => handleDraftCoverLetter(job)}
                          className="py-1.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-650 dark:bg-slate-900 dark:text-slate-450 dark:hover:bg-slate-850 transition-all flex items-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5 text-sky-500" /> Draft Cover Letter
                        </button>

                        <button
                          onClick={() => handleToggleExpand(index)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 dark:border-slate-850 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                    </div>

                    {/* Expandable description */}
                    {isExpanded && (
                      <div className="mt-5 border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
                        
                        {job.reasoning && (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold mb-2">
                              <BookOpen className="h-4 w-4 text-indigo-400" /> AI Fit Analysis
                            </div>
                            <p className="whitespace-pre-line mb-3">{job.reasoning}</p>
                            
                            {(job.matched_skills && job.matched_skills.length > 0) && (
                              <div className="mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Matched Skills</span>
                                <div className="flex flex-wrap gap-1">
                                  {job.matched_skills.map((s, idx) => (
                                    <span key={idx} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      ✓ {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(job.missing_skills && job.missing_skills.length > 0) && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Missing Skills</span>
                                <div className="flex flex-wrap gap-1">
                                  {job.missing_skills.map((s, idx) => (
                                    <span key={idx} className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      ✗ {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider mb-2">Job Description</h4>
                          <p className="leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-3.5 border border-slate-100 dark:border-slate-800/40 rounded-xl font-medium">
                            {job.description}
                          </p>
                        </div>

                        {job.url && (
                          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-750 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                            >
                              Apply on Site <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {!isSearching && lastSearchResults.length === 0 && (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Search className="h-10 w-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-slate-650 dark:text-slate-455">Ready to Search</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-normal font-semibold">
                Use the search box above to find jobs across LinkedIn, Indeed, and Glassdoor.
              </p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CUSTOM FIT EVALUATOR */}
      {activeTab === 'evaluator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PASTE JOB BOX */}
          <div className="lg:col-span-2 p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FlameKindling className="h-5 w-5 text-indigo-500" /> Paste Job Specifications
            </h3>

            <form onSubmit={handleManualFitSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Lead React Developer"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  Job Description Text *
                </label>
                <textarea
                  required
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste the full job posting requirements here..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="submit"
                  disabled={manualFitLoading || !manualDescription || !manualTitle}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                >
                  {manualFitLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Analyzing Fit...
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Check My Fit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RESULTS PANEL */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 h-full flex flex-col justify-between shadow-sm">
              
              <div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                  Fit Score Results
                </h3>

                {manualFitLoading && (
                  <div className="py-12 text-center animate-pulse space-y-4">
                    <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  </div>
                )}

                {!manualFitLoading && manualFitResult && manualFitResult.error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/40 text-xs text-rose-650 dark:text-rose-400 font-semibold leading-relaxed">
                    <p className="font-bold text-rose-800 dark:text-rose-400 mb-2">Evaluation Failed</p>
                    <p>{manualFitResult.error}</p>
                  </div>
                )}

                {!manualFitLoading && manualFitResult && !manualFitResult.error && (
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
                            stroke={(manualFitResult.score ?? 0) >= 80 ? '#10b981' : (manualFitResult.score ?? 0) >= 55 ? '#f59e0b' : '#f43f5e'}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={301.6}
                            strokeDashoffset={301.6 - (301.6 * ((manualFitResult.score ?? 0) / 100))}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute text-2xl font-extrabold text-slate-800 dark:text-white">
                          {manualFitResult.score}%
                        </span>
                      </div>
                      
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">
                        Fit Score
                      </span>
                    </div>

                    {/* Matched / Missing list */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Matched Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {(manualFitResult.matched_skills ?? []).map((s, idx) => (
                            <span key={idx} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Missing Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {(manualFitResult.missing_skills ?? []).map((s, idx) => (
                            <span key={idx} className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              ✗ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary explanations */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold mb-2">
                        <BookOpen className="h-4 w-4 text-indigo-400" /> Analysis
                      </div>
                      <p className="whitespace-pre-line">{manualFitResult.reasoning}</p>
                    </div>

                  </div>
                )}

                {!manualFitLoading && !manualFitResult && (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-650 text-xs italic font-semibold">
                    Paste a job description above to see your fit score.
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
