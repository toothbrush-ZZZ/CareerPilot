'use client';

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, Menu, Activity, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const { user } = useAuthStore();

  // Fetch API health status dynamically for real-time presentation feedback
  const { data: healthData, isSuccess } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`);
        if (!res.ok) return { status: 'error', redis: 'down' };
        return await res.json();
      } catch {
        return { status: 'error', redis: 'down' };
      }
    },
    refetchInterval: 15000, // refresh every 15 seconds
  });

  const isApiHealthy = isSuccess && healthData?.status === 'ok';

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between bg-white/80 border-b border-slate-200 px-6 backdrop-blur-md dark:bg-[#0b0f19]/80 dark:border-slate-800 transition-colors duration-200">
      {/* Mobile Toggle & Left Space */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <h2 className="hidden sm:inline-block font-display font-semibold text-lg text-slate-800 dark:text-slate-100">
          Smart Career Dashboard
        </h2>
      </div>

      {/* Right Side Tools (Health monitor, Theme switch, User Profile) */}
      <div className="flex items-center gap-4">
        {/* API Health Pill */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
          isApiHealthy
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/60'
            : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800/60'
        }`}>
          <Activity className={`h-3.5 w-3.5 ${isApiHealthy ? 'animate-pulse' : ''}`} />
          <span className="hidden md:inline">API Service:</span>
          <span className="font-semibold capitalize">{isApiHealthy ? 'Operational' : 'Disconnected'}</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* User Badge */}
        {user && (
          <Link href="/profile" className="flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-slate-800 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-semibold text-sm shadow-sm group-hover:opacity-90 transition-opacity">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:underline">
                {user.full_name}
              </span>
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 inline" /> Member
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
