'use client';

import React, { useEffect } from 'react';
import { Terminal, Flame, Bell, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { useTrackerStore } from '@/lib/store/useTrackerStore';
import { useJobStore } from '@/lib/store/useJobStore';

export function StatusHood() {
  const { cvUploaded, initStore } = useAppStore();
  const { stats, loadData: loadDash } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const streak = stats?.streak_counter || 0;

  const router = useRouter();

  useEffect(() => {
    initStore().then(() => {
      if (!useAppStore.getState().isAuthenticated) {
        router.push('/');
      }
    });
    loadDash();
  }, [initStore, loadDash, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        initStore(),
        useDashboardStore.getState().loadData(true),
        useTrackerStore.getState().loadData(true),
        useJobStore.getState().searchJobs(true)
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-14 z-50 flex items-center justify-between px-4 sm:px-6"
      style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 var(--cp-border)',
      }}
    >
      
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, var(--cp-accent-glow) 30%, var(--cp-accent-glow) 70%, transparent 95%)',
        }}
      />

      
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: 'var(--cp-accent)' }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: 'var(--cp-accent)', boxShadow: '0 0 8px var(--cp-accent)' }}
          />
        </span>
        <span
          className="text-sm font-semibold tracking-[-0.01em] hidden sm:inline-block select-none"
          style={{
            background: 'var(--cp-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CareerPilot
        </span>
        <span
          className="font-mono text-[10px] tracking-widest hidden lg:inline-block"
          style={{ color: 'var(--cp-text-muted)', opacity: 0.6 }}
        >
          {`// Mission runtime`}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[10px] sm:text-xs font-bold transition-all duration-300 hover:scale-105 cursor-default"
          style={{
            color: 'var(--cp-text-primary)',
            background: 'var(--cp-surface)',
            border: '1px solid var(--cp-border)'
          }}
          title="Current Streak"
        >
          <span style={{ color: 'var(--cp-gold)' }}>🔥</span>
          <span>{streak}</span>
        </div>

        <button
          onClick={handleRefresh}
          className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-[var(--cp-surface)]"
          style={{ color: 'var(--cp-text-muted)' }}
          title="Refresh Data"
        >
          <RefreshCw size={16} strokeWidth={1.5} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        <Link
          href="/dashboard?tab=overview"
          className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-[var(--cp-surface)]"
          style={{ color: 'var(--cp-text-muted)' }}
        >
          <Bell size={16} strokeWidth={1.5} />
          {stats?.nudge && (
            <span 
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--cp-accent)', boxShadow: '0 0 6px var(--cp-accent)' }}
            />
          )}
        </Link>
      </div>
    </div>
  );
}
