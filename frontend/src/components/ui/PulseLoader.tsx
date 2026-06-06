'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface PulseLoaderProps {
  size?: number;
  className?: string;
}

export function PulseLoader({ size = 48, className }: PulseLoaderProps) {
  const transition = {
    duration: 1.4,
    ease: "easeOut" as const,
    repeat: Infinity,
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)} 
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute rounded-full border-2 border-hud-blue"
        style={{ width: size * 0.8, height: size * 0.8 }}
        initial={{ scale: 0.8, opacity: 1 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ ...transition, delay: 0 }}
      />
      <motion.div
        className="absolute rounded-full border-2 border-hud-blue"
        style={{ width: size * 0.8, height: size * 0.8 }}
        initial={{ scale: 0.8, opacity: 1 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ ...transition, delay: 0.7 }}
      />
      {/* Center dot */}
      <div className="absolute w-2 h-2 rounded-full bg-hud-blue" />
    </div>
  );
}
