'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-11 h-[22px] rounded-full border border-[#1a1a1a] bg-[#050505]" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center w-11 h-[22px] rounded-full outline-none cursor-pointer transition-colors duration-300"
      style={{
        backgroundColor: isDark ? '#050505' : '#e2e8e4',
        border: isDark ? '1px solid #1a1a1a' : '1px solid #d1d8d3',
      }}
      aria-label="Toggle theme"
    >
      <div
        className="absolute w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          left: isDark ? '3px' : '25px',
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? '#555555' : '#16a34a'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: isDark ? 'none' : 'drop-shadow(0 0 1px rgba(22,163,74,0.3))',
            transition: 'stroke 0.3s, filter 0.3s'
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
    </button>
  );
}
