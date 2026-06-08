'use client';

import React from 'react';
import { StatusHood } from '@/components/layout/StatusHood';
import { CommandDock } from '@/components/layout/CommandDock';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAppStore } from '@/lib/store/useAppStore';
import { PulseLoader } from '@/components/ui/PulseLoader';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{ background: 'var(--cp-bg)' }}>
        <PulseLoader size={60} />
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full h-screen flex flex-col overflow-hidden">
      <StatusHood />

      <main className="w-full h-full pt-14 pb-24 flex items-start justify-center px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl w-full h-full">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      <CommandDock />
    </div>
  );
}
