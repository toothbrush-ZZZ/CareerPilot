'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import { Compass } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Simple client-side auth guard
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Wait for mount on client to avoid hydrations mismatch or flickering
  if (!isMounted || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b0f19] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 animate-spin">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-slate-400 font-semibold tracking-wider animate-pulse uppercase text-xs">
            Aligning dashboard credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main layout container */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarOpen ? "pl-0 md:pl-64" : "pl-0 md:pl-20"
        )}
      >
        {/* Top header navigation */}
        <Header />

        {/* Dynamic page contents */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>

        {/* Dashboard Footer */}
        <footer className="py-6 text-center border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500">
          CareerPilot &copy; {new Date().getFullYear()} &bull; Built with premium Next.js AI Copilot.
        </footer>
      </div>
    </div>
  );
}
