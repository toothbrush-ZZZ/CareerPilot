'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { authService, setAuthToken } from '@/lib/utils/api';
import { Compass, Sparkles, ArrowRight, LogIn, Briefcase, ClipboardList, MessageSquareCode } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);


  return (
    <div 
      className="h-screen w-full flex flex-col relative overflow-y-auto"
      style={{ background: 'var(--cp-bg)', color: 'var(--cp-text-primary)' }}
    >
      <header 
        className="relative z-10 w-full mx-auto px-6 md:px-12 h-20 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--cp-border)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
            style={{ background: 'var(--cp-text-primary)', color: 'var(--cp-bg)' }}
          >
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            CareerPilot
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {mounted && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'var(--cp-card)', color: 'var(--cp-text-primary)', border: '1px solid var(--cp-border)' }}
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold transition-colors"
                style={{ color: 'var(--cp-text-secondary)' }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="py-2 px-4 rounded-xl text-xs font-bold transition-all"
                style={{ background: 'var(--cp-card)', color: 'var(--cp-text-primary)', border: '1px solid var(--cp-border-accent)' }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative z-10 flex-1 w-full mx-auto px-6 md:px-12 py-16 md:py-24 text-center flex flex-col items-center justify-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-[-0.01em] mb-6"
          style={{ background: 'var(--cp-accent-dim)', border: '1px solid var(--cp-border-accent)', color: 'var(--cp-text-primary)' }}
        >
          <Sparkles className="h-3.5 w-3.5" /> Autonomous AI Career Copilot
        </div>

        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-[1.1] max-w-3xl">
          Navigate Your Next{' '}
          <span style={{ color: 'var(--cp-accent)' }}>
            Career Move
          </span>{' '}
          with AI Intellect
        </h1>

        <p className="text-base md:text-lg max-w-2xl mt-6 leading-relaxed font-medium" style={{ color: 'var(--cp-text-secondary)' }}>
          A modern SaaS experience to aggregate real-time job scraping, evaluate
          resume fit, log application boards, auto-generate cover letters, and chat with
          a dedicated career counselor.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-3 px-8 rounded-2xl text-sm font-bold shadow-lg transition-all"
            style={{ background: 'var(--cp-text-primary)', color: 'var(--cp-bg)' }}
          >
            <LogIn className="h-4 w-4" /> Get Started
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-20 text-left">
          <div 
            className="p-6 rounded-2xl backdrop-blur-sm"
            style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}
          >
            <div 
              className="h-10 w-10 flex items-center justify-center rounded-xl mb-4"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-accent)', color: 'var(--cp-text-primary)' }}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Live Job Hunting & Scrape</h3>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--cp-text-secondary)' }}>
              Search real-time listings across global aggregators using keywords. Calculates instantaneous match compatibility scores based on your CV details.
            </p>
          </div>

          <div 
            className="p-6 rounded-2xl backdrop-blur-sm"
            style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}
          >
            <div 
              className="h-10 w-10 flex items-center justify-center rounded-xl mb-4"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-accent)', color: 'var(--cp-text-primary)' }}
            >
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Kanban Pipeline Tracker</h3>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--cp-text-secondary)' }}>
              Organize job submissions cleanly inside active application columns (Applied, Interviewing, Offer, Rejected) with notes, metadata, and status toggles.
            </p>
          </div>

          <div 
            className="p-6 rounded-2xl backdrop-blur-sm"
            style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}
          >
            <div 
              className="h-10 w-10 flex items-center justify-center rounded-xl mb-4"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-accent)', color: 'var(--cp-text-primary)' }}
            >
              <MessageSquareCode className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Career Assistant Chat</h3>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--cp-text-secondary)' }}>
              Prompt the conversational AI model to answer career milestones, extract skills directly from your resume context, and practice mock interview drills.
            </p>
          </div>
        </div>
      </section>

      <footer 
        className="relative z-10 py-8 text-center text-xs w-full mx-auto px-6 md:px-12"
        style={{ color: 'var(--cp-text-muted)', borderTop: '1px solid var(--cp-border)' }}
      >
        CareerPilot SaaS &bull; Dedicated AI Stack 2026.
      </footer>
    </div>
  );
}
