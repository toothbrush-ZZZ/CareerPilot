'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coverLetterService } from '@/services/coverLetter';
import { cvService } from '@/services/cv';
import { trackerService } from '@/services/tracker';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  FileWarning,
  Undo,
  Briefcase,
  MapPin,
  ClipboardList,
  Layers,
  FileSignature,
  Edit2
} from 'lucide-react';

export default function CoverLetterBuilder() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Input states
  const [activeMode, setActiveMode] = useState<'paste' | 'manual'>('paste');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [userName, setUserName] = useState(user?.full_name || '');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'formal' | 'conversational' | 'enthusiastic'>('formal');

  // Preview & Editing states
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedToTracker, setSavedToTracker] = useState(false);

  // Check if CV uploaded
  const { data: cvStatus, isLoading: cvStatusLoading } = useQuery({
    queryKey: ['cv-status'],
    queryFn: cvService.getCVStatus,
  });

  useEffect(() => {
    if (user?.full_name && !userName) {
      setUserName(user.full_name);
    }
  }, [user, userName]);

  // Mutations
  const generateMutation = useMutation({
    mutationFn: coverLetterService.generateCoverLetter,
    onSuccess: (data) => {
      setGeneratedLetter(data.letter_text);
      setEditText(data.letter_text);
      setIsEditing(false);
      setSavedToTracker(false);
    },
  });

  const trackerMutation = useMutation({
    mutationFn: trackerService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSavedToTracker(true);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return;
    if (activeMode === 'paste' && !jobDescription) return;
    if (activeMode === 'manual' && !roleTitle) return;

    setSavedToTracker(false);

    generateMutation.mutate({
      mode: activeMode,
      job_description: activeMode === 'paste' ? jobDescription : undefined,
      company_name: companyName || undefined,
      role_title: activeMode === 'manual' ? roleTitle : undefined,
      location: activeMode === 'manual' ? location : undefined,
      requirements: activeMode === 'manual' ? requirements : undefined,
      user_name: userName,
      tone: tone,
    });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = isEditing ? editText : generatedLetter;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToTracker = () => {
    if (trackerMutation.isPending || savedToTracker) return;

    const title = activeMode === 'manual' ? roleTitle : 'Applied Role';
    const company = companyName || 'Unknown Company';
    const loc = activeMode === 'manual' ? location : 'Remote';

    trackerMutation.mutate({
      job_title: title,
      company: company,
      location: loc,
      job_url: '',
      status: 'applied',
      notes: isEditing ? editText : generatedLetter,
    });
  };

  const handleSaveEdit = () => {
    setGeneratedLetter(editText);
    setIsEditing(false);
  };

  const handleRestart = () => {
    setGeneratedLetter('');
    setEditText('');
    setIsEditing(false);
    setSavedToTracker(false);
  };

  const hasCV = cvStatus?.has_cv;

  if (cvStatusLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning banner if CV is missing */}
      {!hasCV && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-3 animate-pulse">
          <FileWarning className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Resume upload required</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              The AI Cover Letter generator requires details parsed from your CV profile to personalize content. Please go to the{' '}
              <a href="/cv" className="text-sky-400 hover:underline font-bold">CV Manager</a> to upload one first.
            </p>
          </div>
        </div>
      )}

      {/* Workspace Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm">
            <h3 className="font-semibold text-base text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-500 animate-pulse" /> Letter Specifications
            </h3>

            {/* Input Mode Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/40 mb-5 gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('paste');
                  setSavedToTracker(false);
                }}
                className={`pb-2.5 text-xs font-bold transition-all relative ${
                  activeMode === 'paste'
                    ? 'text-sky-500'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                📋 Paste JD
                {activeMode === 'paste' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('manual');
                  setSavedToTracker(false);
                }}
                className={`pb-2.5 text-xs font-bold transition-all relative ${
                  activeMode === 'manual'
                    ? 'text-sky-500'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                ✏️ Describe Manually
                {activeMode === 'manual' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Devin Pilot"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Supabase, Pathao"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              {/* Mode A: Paste JD */}
              {activeMode === 'paste' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Paste Job Description *
                  </label>
                  <textarea
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    placeholder="Paste the target job description requirements. Provide details about technical scope..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                  {jobDescription && jobDescription.length < 50 && (
                    <p className="text-[10px] text-amber-500 mt-1 font-semibold">
                      💡 Add more detail for a more personalized letter.
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                    Note: If description is in Bengali or mixed language, the cover letter will still be generated in English.
                  </p>
                </div>
              )}

              {/* Mode B: Manual Details */}
              {activeMode === 'manual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Job Title *
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

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Remote, Dhaka"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Key Requirements
                    </label>
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      rows={3}
                      placeholder="e.g. 5 years Django, REST APIs, PostgreSQL"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Tone Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tone Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'formal', label: 'Formal' },
                    { id: 'conversational', label: 'Conversational' },
                    { id: 'enthusiastic', label: 'Enthusiastic' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] ${
                        tone === t.id
                          ? 'border-sky-500 bg-sky-500/10 text-sky-500 dark:border-sky-400/30'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="submit"
                  disabled={generateMutation.isPending || !hasCV}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Tailoring Document...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-3.5 w-3.5" /> Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Generated Output Document */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-[#141b2c] min-h-[500px] flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div>
              {/* Header inside Preview Box */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
                <h3 className="font-semibold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-sky-500" /> Document Preview
                </h3>

                {generatedLetter && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-all active:scale-[0.97]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSaveEdit();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-all active:scale-[0.97]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      {isEditing ? 'Done' : 'Edit'}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-all active:scale-[0.97]"
                    >
                      <Undo className="h-3.5 w-3.5" /> Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Title / Company Heading above cover letter */}
              {generatedLetter && (
                <div className="mb-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl dark:bg-slate-900/60 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Drafted for: {activeMode === 'manual' ? roleTitle : 'Pasted Job Description'}
                  </h4>
                  {companyName && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                      🏢 Company: {companyName}
                    </p>
                  )}
                </div>
              )}

              {/* Loader */}
              {generateMutation.isPending && (
                <div className="py-24 text-center animate-pulse space-y-4">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                </div>
              )}

              {/* Text content area */}
              {!generateMutation.isPending && generatedLetter && (
                <div className="p-5 border border-slate-200/80 bg-slate-50 rounded-2xl dark:bg-slate-900/40 dark:border-slate-850 max-h-[480px] overflow-y-auto font-serif text-sm leading-relaxed text-slate-700 dark:text-slate-300 shadow-inner">
                  {isEditing ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={15}
                      className="w-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{generatedLetter}</p>
                  )}
                </div>
              )}

              {/* Empty placeholder */}
              {!generateMutation.isPending && !generatedLetter && (
                <div className="text-center py-24 text-slate-400 dark:text-slate-600 text-xs italic font-semibold">
                  Complete the parameters on the left and submit to generate your document draft here.
                </div>
              )}
            </div>

            {/* Bottom Actions: Save to Tracker */}
            {generatedLetter && (
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4">
                <button
                  type="button"
                  onClick={handleSaveToTracker}
                  disabled={trackerMutation.isPending || savedToTracker}
                  className={`py-2 px-4 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] ${
                    savedToTracker
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'
                  }`}
                >
                  {trackerMutation.isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : savedToTracker ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Saved to Pipeline!
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-3.5 w-3.5" /> Save to Kanban Tracker
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
