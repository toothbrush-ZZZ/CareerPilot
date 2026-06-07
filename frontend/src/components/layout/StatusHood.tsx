'use client';

import React, { useEffect } from 'react';
import { Terminal, Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
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

      
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        <div
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg"
          style={{
            background: 'var(--cp-accent-dim)',
            border: cvUploaded
              ? '1px solid var(--cp-accent)'
              : '1px solid var(--cp-danger)',
          }}
        >
          <Terminal className="w-3.5 h-3.5 hidden sm:block" style={{ color: 'var(--cp-text-muted)' }} />
          <span className="text-[10px] font-mono hidden sm:block" style={{ color: 'var(--cp-text-muted)' }}>RAG:</span>
          <span
            className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${!cvUploaded ? 'rag-dot' : ''}`}
            style={{
              backgroundColor: cvUploaded ? 'var(--cp-accent)' : 'var(--cp-danger)',
              boxShadow: cvUploaded ? '0 0 6px var(--cp-accent)' : 'none',
            }}
          />
          <span
            className="text-[10px] sm:text-xs font-bold font-mono tracking-wider"
            style={{ color: cvUploaded ? 'var(--cp-accent)' : 'var(--cp-danger)' }}
          >
            {cvUploaded ? 'Grounded' : 'No context'}
          </span>
        </div>

        
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-mono text-[10px] sm:text-xs font-bold transition-all duration-300 hover:scale-105 cursor-default"
          style={{
            color: 'var(--cp-gold)',
            boxShadow: '0 0 12px rgba(200,169,110,0.20)',
          }}
        >
          <Flame size={16} strokeWidth={1.5} style={{ color: 'var(--cp-gold)' }} />
          <span>
            <span className="hidden sm:inline">Streak: </span>
            {streak}
            <span className="hidden sm:inline"> days</span>
          </span>
        </div>
      </div>
    </div>
  );
}
