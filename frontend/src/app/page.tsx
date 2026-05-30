'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth';
import { Compass, Sparkles, Briefcase, ClipboardList, Target, MessageSquareCode, LogIn, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  // Quick launch demo login
  const handleLaunchDemo = async () => {
    setIsLoading(true);
    try {
      const demoEmail = 'demo@careerpilot.ai';
      const demoPassword = 'demopassword';

      const authData = await authService.login(demoEmail, demoPassword);
      useAuthStore.setState({ token: authData.access_token });
      const profile = await authService.getProfile();

      login(authData.access_token, profile);
      router.push('/dashboard');
    } catch {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white flex flex-col relative overflow-hidden">
      
      {/* Dynamic Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-glow" />

      {/* Header / Navigation bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/40">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            CareerPilot
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-750 border border-slate-750 transition-all"
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" /> Autonomous AI Career Copilot
        </div>

        <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white tracking-tight leading-[1.1] max-w-3xl">
          Navigate Your Next{' '}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Career Move
          </span>{' '}
          with AI Intellect
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mt-6 leading-relaxed font-medium">
          A modern, hackathon-optimized SaaS experience to aggregate real-time job scraping, evaluate resume fit, log application boards, auto-generate cover letters, and chat with a dedicated career counselor.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleLaunchDemo}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-3 px-8 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Bootstrapping Demo...' : 'Instant Demo Preview'}
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-2xl text-sm font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <LogIn className="h-4 w-4" /> standard Login
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20 text-left">
          
          {/* Card 1: Job search */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100 mb-2">Live Job Hunting & Scrape</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Search real-time listings across global aggregators using keywords. Calculates instantaneous match compatibility scores based on your CV details.
            </p>
          </div>

          {/* Card 2: Kanban board */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100 mb-2">Kanban Pipeline Tracker</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Organize job submissions cleanly inside active application columns (Applied, Interviewing, Offer, Rejected) with notes, metadata, and status toggles.
            </p>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
              <MessageSquareCode className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100 mb-2">AI Career Assistant Chat</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Prompt the conversational AI model to answer career milestones, extract skills directly from your resume context, and practice mock interview drills.
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-xs text-slate-500 border-t border-slate-800/40 w-full max-w-7xl mx-auto px-6">
        CareerPilot SaaS &bull; Dedicated AI Hackathon Stack 2026.
      </footer>

    </div>
  );
}
