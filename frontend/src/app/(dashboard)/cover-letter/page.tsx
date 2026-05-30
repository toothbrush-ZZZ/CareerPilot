'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { coverLetterService } from '@/services/coverLetter';
import { cvService } from '@/services/cv';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Send,
  RefreshCw,
  SlidersHorizontal,
  Undo,
  FileCheck,
  FileWarning,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export default function CoverLetterWorkspace() {
  const [activeStep, setActiveStep] = useState<'create' | 'editor'>('create');
  
  // Input fields
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Generated results
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');

  // Check if CV uploaded
  const { data: cvStatus, isLoading: cvStatusLoading } = useQuery({
    queryKey: ['cv-status'],
    queryFn: cvService.getCVStatus,
  });

  // Mutations
  const generateMutation = useMutation({
    mutationFn: coverLetterService.generateCoverLetter,
    onSuccess: (data) => {
      setGeneratedLetter(data.letter_text);
      setActiveStep('editor');
      setRefinementInput('');
    },
  });

  const refineMutation = useMutation({
    mutationFn: coverLetterService.refineCoverLetter,
    onSuccess: (data) => {
      setGeneratedLetter(data.letter_text);
      setRefinementInput('');
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !roleTitle || !userName || !jobDescription) return;
    
    generateMutation.mutate({
      job_description: jobDescription,
      company_name: companyName,
      role_title: roleTitle,
      user_name: userName,
    });
  };

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput || !generatedLetter || !jobDescription) return;

    refineMutation.mutate({
      existing_letter: generatedLetter,
      feedback: refinementInput,
      job_description: jobDescription,
    });
  };

  const handleCopyToClipboard = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestart = () => {
    setGeneratedLetter('');
    setActiveStep('create');
  };

  const hasCV = cvStatus?.has_cv;

  if (cvStatusLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            AI Cover Letter Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Draft tailored, high-converting letters matching specific job description vectors.
          </p>
        </div>

        {activeStep === 'editor' && (
          <button
            onClick={handleRestart}
            className="self-start sm:self-auto flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-[#0d1527] dark:border-slate-800 dark:hover:bg-slate-900 active:scale-[0.98] transition-all"
          >
            <Undo className="h-4 w-4" /> Start Over
          </button>
        )}
      </div>

      {/* Renders warning if no CV exists */}
      {!hasCV && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-3">
          <FileWarning className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Resume upload required</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              The AI Cover Letter generator requires details parsed from your CV profile to tailoring letter content. Please go to the{' '}
              <a href="/cv" className="text-sky-400 hover:underline">CV Manager</a> to upload one first.
            </p>
          </div>
        </div>
      )}

      {/* RENDER DUAL-PANE COPT-LETTER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: PARAMETERS BUILDER & CHAT REFINEMENT */}
        <div className="space-y-6">
          
          {/* STEP 1: INITIAL DETAILS GENERATOR */}
          {activeStep === 'create' && (
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-500" /> Letter Parameters
              </h3>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Supabase, Vercel"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Role / Position *
                    </label>
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Backend Developer"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Devin Pilot"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Job Description Specs *
                  </label>
                  <textarea
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    placeholder="Paste the target job description requirements. Mention core skills, expected scope, etc..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    type="submit"
                    disabled={generateMutation.isPending || !hasCV}
                    className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Drafting customized cover letter...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-3.5 w-3.5" /> Generate Tailored Letter
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: ITERATIVE CHAT REFINEMENT CONSOLE */}
          {activeStep === 'editor' && (
            <div className="p-6 bg-gradient-to-br from-indigo-900/10 via-[#0d1527] to-[#090e1b] border border-slate-800 rounded-2xl relative overflow-hidden">
              {/* Glow decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
              
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-base text-white">
                  Refine Cover Letter
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-4 font-semibold leading-relaxed">
                Provide inline suggestions or directives to update the letter (e.g., "Make it shorter", "Mention my database optimization work at DevCorp").
              </p>

              <form onSubmit={handleRefine} className="space-y-4 relative z-10">
                <div className="relative">
                  <textarea
                    required
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    rows={4}
                    placeholder="e.g. Make it more concise and sound extremely enthusiastic..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-200"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={refineMutation.isPending || !refinementInput}
                    className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {refineMutation.isPending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Rewriting layout...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Submit Updates
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: GENERATED OUTPUT PREVIEW PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 min-h-[500px] flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-sky-500" /> Letter Document Preview
                </h3>
                
                {generatedLetter && (
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-all active:scale-[0.97]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Text
                      </>
                    )}
                  </button>
                )}
              </div>

              {generateMutation.isPending && (
                <div className="py-24 text-center animate-pulse space-y-4">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                </div>
              )}

              {!generateMutation.isPending && generatedLetter && (
                <div className="p-5 border border-slate-200/80 bg-slate-50 rounded-2xl dark:bg-slate-900/40 dark:border-slate-850 max-h-[550px] overflow-y-auto font-serif text-sm leading-relaxed text-slate-700 dark:text-slate-350 shadow-inner">
                  <p className="whitespace-pre-wrap">{generatedLetter}</p>
                </div>
              )}

              {!generateMutation.isPending && !generatedLetter && (
                <div className="text-center py-24 text-slate-400 dark:text-slate-600 text-xs italic font-semibold">
                  Complete the parameters on the left and submit to generate your document draft here.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
