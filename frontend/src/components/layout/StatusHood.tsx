'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Flame, Bell, RefreshCw, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { useTrackerStore } from '@/lib/store/useTrackerStore';
import { useJobStore } from '@/lib/store/useJobStore';
import { NudgeCard } from '@/components/dashboard/NudgeCard';

export function StatusHood() {
  const { cvUploaded, initStore } = useAppStore();
  const { stats, loadData: loadDash } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  
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

        <div className="relative">
          <button
            onClick={() => setShowNudge(!showNudge)}
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
          </button>
          {showNudge && (
            <div className="absolute right-0 top-full mt-2 w-[320px] shadow-2xl z-50">
              <NudgeCard nudge={stats?.nudge || null} />
            </div>
          )}
        </div>

        <button
          onClick={() => {
            import('@/lib/utils/api').then(({ setAuthToken }) => setAuthToken(''));
            useAppStore.getState().logout();
            router.push('/');
          }}
          className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-red-500/10"
          style={{ color: 'var(--cp-text-muted)' }}
          title="Logout"
        >
          <LogOut size={16} strokeWidth={1.5} className="hover:text-[var(--cp-danger)] transition-colors" />
        </button>
      </div>
    </div>
  );
}
