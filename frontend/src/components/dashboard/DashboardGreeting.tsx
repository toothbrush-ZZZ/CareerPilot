import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  firstName: string;
  streak: number;
}

export function DashboardGreeting({ firstName }: Props) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cp-text-primary)' }}>
        {getGreeting()}, {firstName} <span className="inline-block origin-bottom-right hover:animate-wave">👋</span>
      </h1>
    </div>
  );
}
