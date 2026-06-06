'use client';

import React, { useEffect } from 'react';
import { Terminal, Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { MOCK_STATS } from '@/lib/utils/mockData';

export function StatusHood() {
  const { cvUploaded, initStore } = useAppStore();
  const streak = MOCK_STATS.streak;

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-14 z-50 flex items-center justify-between px-4 sm:px-6"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 1px 0 var(--nav-border)',
      }}
    >
      {/* Bottom gradient accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(37,99,235,0.4) 30%, rgba(124,58,237,0.3) 70%, transparent 95%)',
        }}
      />

      {/* Left — Branding */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: 'var(--hud-blue)' }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: 'var(--hud-blue)', boxShadow: '0 0 8px var(--hud-blue)' }}
          />
        </span>
        <span
          className="font-mono text-[11px] font-bold tracking-widest uppercase hidden sm:inline-block select-none"
          style={{
            background: 'linear-gradient(135deg, var(--hud-blue), #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CareerHUD
        </span>
        <span
          className="font-mono text-[10px] tracking-widest uppercase hidden lg:inline-block"
          style={{ color: 'var(--text-muted)', opacity: 0.6 }}
        >
          // MISSION RUNTIME
        </span>
      </div>

      {/* Right — Status badges */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* RAG Core Badge */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg"
          style={{
            background: cvUploaded
              ? 'rgba(5,150,105,0.08)'
              : 'rgba(220,38,38,0.07)',
            border: cvUploaded
              ? '1px solid rgba(5,150,105,0.25)'
              : '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <Terminal className="w-3.5 h-3.5 hidden sm:block" style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] font-mono hidden sm:block" style={{ color: 'var(--text-muted)' }}>RAG:</span>
          <span
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: cvUploaded ? '#10b981' : '#f43f5e',
              boxShadow: cvUploaded ? '0 0 6px #10b981' : '0 0 6px #f43f5e',
            }}
          />
          <span
            className="text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider"
            style={{ color: cvUploaded ? '#059669' : '#dc2626' }}
          >
            {cvUploaded ? 'Grounded' : 'No Context'}
          </span>
        </div>

        {/* Streak Badge */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs font-bold"
          style={{
            background: 'rgba(217,119,6,0.09)',
            border: '1px solid rgba(217,119,6,0.25)',
            color: '#d97706',
          }}
        >
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ fill: '#d97706' }} />
          <span>
            <span className="hidden sm:inline">STREAK: </span>
            {streak}
            <span className="hidden sm:inline"> DAYS</span>
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}
