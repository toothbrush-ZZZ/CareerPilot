'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Bot, KanbanSquare, UserCheck, LogOut, FileText } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { setAuthToken } from '@/lib/utils/api';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs',      label: 'Jobs',      icon: Briefcase },
  { href: '/assistant', label: 'Assistant', icon: Bot },
  { href: '/tracker',   label: 'Tracker',   icon: KanbanSquare },
  { href: '/cv',        label: 'Resume',    icon: FileText },
  { href: '/profile',   label: 'Profile',   icon: UserCheck },
];

export function CommandDock() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center z-50 px-4">
      <nav
        className="relative flex items-center gap-0.5 sm:gap-1 px-2 py-2 rounded-2xl shadow-xl"
        style={{
          background: 'rgba(10,10,10,0.92)',
          border: '1px solid var(--cp-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px var(--cp-border), 0 1px 0 var(--cp-border) inset',
        }}
        aria-label="Main navigation"
      >
        
        <div
          className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--cp-accent-glow), var(--cp-accent-glow), transparent)',
          }}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center gap-1 px-3.5 sm:px-4 py-2.5 rounded-xl transition-all outline-none group focus-visible:ring-2"
              style={{ color: isActive ? 'var(--cp-accent)' : 'var(--cp-text-muted)' }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              
              {isActive && (
                <motion.div
                  layoutId="dockActivePill"
                  className="absolute inset-0 rounded-xl z-0"
                  style={{
                    background: 'var(--cp-accent-dim)',
                    border: '1px solid var(--cp-border-accent)',
                    boxShadow: '0 2px 12px var(--cp-border-accent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'var(--cp-accent-dim)' }}
                />
              )}

              
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  size={24}
                  className="transition-transform duration-150 group-hover:scale-110"
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
                <span
                  className="text-[9px] sm:text-[10px] font-semibold tracking-wide leading-none transition-colors duration-150"
                  style={{ color: isActive ? 'var(--cp-accent)' : 'var(--cp-text-muted)' }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}

        <div className="w-px h-8 bg-[var(--cp-border)] mx-1" />

        <button
          onClick={() => {
            setAuthToken('');
            useAppStore.getState().setUser(null);
            router.push('/');
          }}
          className="relative flex flex-col items-center gap-1 px-3.5 sm:px-4 py-2.5 rounded-xl transition-all outline-none group focus-visible:ring-2 text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)]"
          title="Logout"
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-red-500/10" />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <LogOut size={24} className="transition-transform duration-150 group-hover:scale-110" strokeWidth={1.5} />
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide leading-none transition-colors duration-150">
              Logout
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
}
