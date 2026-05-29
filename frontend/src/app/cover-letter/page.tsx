'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { careerApi } from '@/lib/api';
import { 
  FileText, 
  Loader2, 
  Sparkles, 
  Clipboard, 
  Check, 
  Send,
  Plus,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

function CoverLetterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [roleTitle, setRoleTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userName, setUserName] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToTracker, setSavedToTracker] = useState(false);
  
  const [letterText, setLetterText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [keyPointsUsed, setKeyPointsUsed] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  
  const [hasCV, setHasCV] = useState(false);
  const [checkingCV, setCheckingCV] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const [error, setError] = useState('');

  // Read search parameters from URL (e.g., passed from Job Hunter)
  useEffect(() => {
    const role = searchParams.get('role');
    const company = searchParams.get('company');
    const desc = searchParams.get('desc');
    
    if (role) setRoleTitle(role);
    if (company) setCompanyName(company);
    if (desc) setJobDescription(desc);
  }, [searchParams]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [cvRes, profileRes] = await Promise.all([
          careerApi.getCVStatus(),
          careerApi.getProfile()
        ]);
        setHasCV(cvRes.data.has_cv);
        setProfile(profileRes.data);
        if (profileRes.data?.full_name) {
          setUserName(profileRes.data.full_name);
        }
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setCheckingCV(false);
      }
    };
    initData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle || !companyName || !jobDescription) {
      setError('Please fill in all the fields.');
      return;
    }
    
    setError('');
    setGenerating(true);
    setSavedToTracker(false);
    
    try {
      const res = await careerApi.generateCoverLetter({
        role_title: roleTitle,
        company_name: companyName,
        job_description: jobDescription,
        user_name: userName || 'the applicant'
      });
      
      setLetterText(res.data.letter_text);
      setWordCount(res.data.word_count || res.data.letter_text.split(/\s+/).length);
      setKeyPointsUsed(res.data.key_cv_points_used || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate cover letter. Please check your credentials or backend configurations.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setError('');
    setRefining(true);
    setSavedToTracker(false);
    
    try {
      const res = await careerApi.refineCoverLetter({
        existing_letter: letterText,
        feedback: feedback,
        job_description: jobDescription
      });
      
      setLetterText(res.data.letter_text);
      setWordCount(res.data.word_count || res.data.letter_text.split(/\s+/).length);
      setFeedback('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to refine cover letter.');
    } finally {
      setRefining(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addToTracker = async () => {
    if (savedToTracker) return;
    try {
      await careerApi.createApplication({
        job_title: roleTitle,
        company: companyName,
        location: profile?.location_city || 'Remote',
        job_url: '',
        status: 'applied',
        notes: `Generated Cover Letter:\n\n${letterText}`
      });
      setSavedToTracker(true);
    } catch (err: any) {
      console.error(err);
      setError('Failed to add to tracker: ' + (err.message || 'Unknown error'));
    }
  };

  if (checkingCV) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-white/40 animate-pulse font-medium">Preparing Cover Letter generator...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">AI Cover Letter Generator</h1>
          <p className="text-white/50 mt-1">Grounded in your CV. Tailored to the job role. Refine in real-time.</p>
        </div>
      </div>

      {!hasCV && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center gap-4 max-w-4xl">
          <AlertTriangle size={24} className="text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold">No CV detected!</h4>
            <p className="text-sm text-amber-200/75 mt-0.5">
              CareerPilot needs your CV to ground cover letters in your actual experience. 
              Please upload a CV in the <span className="underline cursor-pointer font-semibold" onClick={() => router.push('/cv')}>CV Builder</span> tab first.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className={cn("xl:col-span-5 space-y-6", !hasCV && "opacity-60 pointer-events-none")}>
          <div className="glass rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Mail className="text-blue-400" size={20} />
              Job Specifications
            </h3>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Your Full Name</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium mt-1.5"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Role Title</label>
                <input 
                  type="text" 
                  value={roleTitle} 
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium mt-1.5"
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Company Name</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium mt-1.5"
                  placeholder="e.g. Google"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Job Description</label>
                <textarea 
                  value={jobDescription} 
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium mt-1.5 custom-scrollbar"
                  placeholder="Paste the job description keywords, duties, and requirements here..."
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={generating || !hasCV}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analyzing CV & Job...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Draft Cover Letter
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="glass rounded-[2rem] p-8 flex-1 flex flex-col min-h-[400px]">
            {letterText ? (
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Generated Letter</span>
                    <span className="text-xs text-blue-400 font-semibold mt-0.5">{wordCount} words</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
                      title="Copy to Clipboard"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Clipboard size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    
                    <button 
                      onClick={addToTracker}
                      disabled={savedToTracker}
                      className={cn(
                        "p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold shadow-lg",
                        savedToTracker 
                          ? "bg-green-600/10 border border-green-600/20 text-green-400 cursor-default" 
                          : "bg-blue-600 hover:bg-blue-500 text-white border border-transparent shadow-blue-500/10"
                      )}
                    >
                      {savedToTracker ? <Check size={14} /> : <Plus size={14} />}
                      {savedToTracker ? 'Added to Tracker' : 'Add to Tracker'}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 custom-scrollbar">
                  <div className="whitespace-pre-wrap text-white/80 leading-relaxed text-sm bg-white/[0.01] p-6 rounded-2xl border border-white/5 font-mono">
                    {letterText}
                  </div>
                </div>

                {keyPointsUsed.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest block">CV Experience Highlighted</span>
                    <div className="flex flex-wrap gap-2">
                      {keyPointsUsed.map((p, i) => (
                        <span key={i} className="text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg px-2.5 py-1.5">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refinement Panel */}
                <div className="mt-4 pt-6 border-t border-white/5">
                  <form onSubmit={handleRefine} className="flex gap-3 items-center">
                    <div className="flex-1 relative group">
                      <input 
                        type="text" 
                        placeholder="Ask to make adjustments (e.g. 'Make it shorter', 'Focus more on React')..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={refining}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!feedback.trim() || refining}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 transition-all text-white flex-shrink-0"
                    >
                      {refining ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/20">
                <FileText size={64} className="mb-4 text-white/10 animate-pulse" />
                <h3 className="text-lg font-bold text-white/40">Ready to Draft</h3>
                <p className="max-w-xs text-sm mt-1 text-white/30 leading-relaxed">
                  Fill in the job details on the left to generate a personalized cover letter matching your CV profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-white/40 animate-pulse font-medium">Preparing Cover Letter generator...</p>
      </div>
    }>
      <CoverLetterContent />
    </Suspense>
  );
}
