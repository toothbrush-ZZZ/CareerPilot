'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Bot, KanbanSquare, UserCheck } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs',      label: 'Jobs',      icon: Briefcase },
  { href: '/assistant', label: 'Assistant', icon: Bot },
  { href: '/tracker',   label: 'Tracker',   icon: KanbanSquare },
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
          background: 'var(--nav-bg)',
          border: '1px solid var(--nav-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.12), 0 1px 0 rgba(255,255,255,0.6) inset',
        }}
        aria-label="Main navigation"
      >
        {/* Top gradient accent line */}
        <div
          className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), rgba(124,58,237,0.4), transparent)',
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
              style={{ color: isActive ? 'var(--nav-icon-active)' : 'var(--nav-icon)' }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="dockActivePill"
                  className="absolute inset-0 rounded-xl z-0"
                  style={{
                    background: 'var(--nav-active-bg)',
                    border: '1px solid var(--nav-active-ring)',
                    boxShadow: '0 2px 12px rgba(37,99,235,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              {/* Hover effect */}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'var(--nav-active-bg)' }}
                />
              )}

              {/* Icon + label */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  className="w-[18px] h-[18px] transition-transform duration-150 group-hover:scale-110"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className="text-[9px] sm:text-[10px] font-semibold tracking-wide leading-none transition-colors duration-150"
                  style={{ color: isActive ? 'var(--nav-icon-active)' : 'var(--nav-label)' }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
