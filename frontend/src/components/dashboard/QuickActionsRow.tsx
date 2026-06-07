import React from 'react';
import { useRouter } from 'next/navigation';

export function QuickActionsRow() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center py-4 mt-4">
      <button
        onClick={() => router.push('/tracker')}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-colors border"
        style={{ 
          borderColor: 'var(--cp-border)', 
          color: 'var(--cp-text-primary)',
          background: 'transparent'
        }}
      >
        + Log Application
      </button>

      <button
        onClick={() => router.push('/dashboard?tab=planner')}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-colors border"
        style={{ 
          borderColor: 'var(--cp-border)', 
          color: 'var(--cp-text-primary)',
          background: 'transparent'
        }}
      >
        + Add Goal
      </button>

      <button
        onClick={() => router.push('/jobs')}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-colors border"
        style={{ 
          borderColor: 'var(--cp-border)', 
          color: 'var(--cp-text-primary)',
          background: 'transparent'
        }}
      >
        Find Jobs
      </button>
    </div>
  );
}
