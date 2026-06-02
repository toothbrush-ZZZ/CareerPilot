'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  FileText,
  Briefcase,
  MessageSquareCode,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', href: '/tracker', icon: ClipboardList },
    { name: 'Goals & Targets', href: '/goals', icon: Target },
    { name: 'CV & Resume', href: '/cv', icon: FileText },
    { name: 'Job Search & Fit', href: '/jobs', icon: Briefcase },
    { name: 'AI Assistant', href: '/assistant', icon: MessageSquareCode },
    { name: 'Profile Settings', href: '/profile', icon: UserCog },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-white border-r border-slate-200 text-slate-700 transition-all duration-300 dark:bg-[#0d1527] dark:border-slate-800 dark:text-slate-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Compass className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-400">
              CareerPilot
            </span>
          )}
        </Link>

        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {sidebarOpen && user && (
        <div className="p-4 mx-3 my-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 dark:from-[#131d35] dark:to-[#172545]/40 dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mb-1">Authenticated</p>
          <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user.full_name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1.5 px-3 py-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-sky-500 dark:text-sky-400" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                )}
              />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-1.5 dark:border-slate-800">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-10 w-full items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-rose-400 transition-all duration-200",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
