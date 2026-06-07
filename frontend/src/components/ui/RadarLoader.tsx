'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MESSAGES = [
  "Scanning 1,200 job boards...",
  "Analyzing skill matches...",
  "Calculating fit scores...",
  "Filtering by location...",
];

export function RadarLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 w-full h-full min-h-[300px]">
      <div className="relative w-[240px] h-[240px] flex items-center justify-center">
        
        <svg width="240" height="240" className="absolute inset-0">
          <circle cx="120" cy="120" r="40" stroke="var(--color-hud-blue)" strokeWidth="1" fill="none" opacity="0.2" />
          <circle cx="120" cy="120" r="70" stroke="var(--color-hud-blue)" strokeWidth="1" fill="none" opacity="0.2" />
          <circle cx="120" cy="120" r="100" stroke="var(--color-hud-blue)" strokeWidth="1" fill="none" opacity="0.2" />
          
          
          <line x1="120" y1="10" x2="120" y2="230" stroke="var(--color-hud-blue)" strokeWidth="1" opacity="0.1" />
          <line x1="10" y1="120" x2="230" y2="120" stroke="var(--color-hud-blue)" strokeWidth="1" opacity="0.1" />
          
          
          <circle cx="120" cy="120" r="3" fill="var(--color-hud-blue)" />
        </svg>

        
        <motion.div
          className="absolute w-[240px] h-[240px] rounded-full overflow-hidden origin-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          
          <div 
            className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, var(--cp-accent-glow) 60deg, var(--cp-accent) 90deg)',
              transform: 'rotate(-90deg)'
            }}
          />
          
          <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-hud-blue origin-bottom" />
        </motion.div>
      </div>

      <div className="mt-8 font-mono text-sm text-hud-blue animate-pulse">
        {MESSAGES[msgIndex]}
      </div>
    </div>
  );
}
