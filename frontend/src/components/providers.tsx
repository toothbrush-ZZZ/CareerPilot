'use client';

import React from 'react';
import { useUIStore } from '@/store/useUIStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const isDark = useUIStore.getState().darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <>{children}</>;
}
