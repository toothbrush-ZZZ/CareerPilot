import React from 'react';
import { StatusHood } from '@/components/layout/StatusHood';
import { CommandDock } from '@/components/layout/CommandDock';
import { PageTransition } from '@/components/layout/PageTransition';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
