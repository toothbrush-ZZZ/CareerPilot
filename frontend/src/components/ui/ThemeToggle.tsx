'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }} />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun size={15} className="text-amber-400" />
        : <Moon size={15} style={{ color: 'var(--text-secondary)' }} />
      }
    </button>
  );
}
