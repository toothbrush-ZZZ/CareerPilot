'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  CheckSquare,
  FileText,
  Mail,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Hunter', href: '/jobs', icon: Search },
  { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
  { name: 'Application Tracker', href: '/tracker', icon: CheckSquare },
  { name: 'CV Builder', href: '/cv', icon: FileText },
  { name: 'Cover Letter', href: '/cover-letter', icon: Mail },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar_collapsed');
      return stored === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Basic route guard
  React.useEffect(() => {
    if (!isAuthPage) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [pathname, isAuthPage, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0b]"></div>;
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0a0a0b]">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? '80px' : '260px' }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#111113] border-r border-white/5 transition-all duration-300 lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <span className="text-xl font-bold tracking-tighter">CP</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
              >
                CareerPilot
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "group-hover:text-white")} />
                {!collapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-3 py-3 transition-colors rounded-xl text-white/50 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => {
            const newState = !collapsed;
            setCollapsed(newState);
            localStorage.setItem('sidebar_collapsed', String(newState));
          }}
          className="absolute -right-3 top-20 hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-[#111113] border border-white/10 text-white/50 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-white/5 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">CareerPilot</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-white/70">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
