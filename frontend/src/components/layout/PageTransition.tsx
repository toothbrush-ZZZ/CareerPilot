'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full h-full bg-[var(--cp-surface)]/60 border border-[var(--cp-border)] backdrop-blur-xl rounded-3xl p-6 shadow-2xl overflow-y-auto custom-scrollbar"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
