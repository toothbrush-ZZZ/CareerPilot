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
          {/* Concentric Radar Rings */}
          <circle cx="120" cy="120" r="35" stroke="var(--cp-accent)" strokeWidth="1" fill="none" opacity="0.15" />
          <circle cx="120" cy="120" r="60" stroke="var(--cp-accent)" strokeWidth="1" fill="none" opacity="0.15" />
          <circle cx="120" cy="120" r="85" stroke="var(--cp-accent)" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.15" />
          <circle cx="120" cy="120" r="110" stroke="var(--cp-accent)" strokeWidth="1" fill="none" opacity="0.25" />
          
          {/* Grid lines (Crosshairs & Diagonals) */}
          <line x1="120" y1="10" x2="120" y2="230" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.15" />
          <line x1="10" y1="120" x2="230" y2="120" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.15" />
          <line x1="42" y1="42" x2="198" y2="198" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.08" strokeDasharray="2 2" />
          <line x1="198" y1="42" x2="42" y2="198" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.08" strokeDasharray="2 2" />
          
          {/* Measuring Ticks along horizontal crosshair */}
          <line x1="60" y1="117" x2="60" y2="123" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          <line x1="90" y1="117" x2="90" y2="123" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          <line x1="150" y1="117" x2="150" y2="123" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          <line x1="180" y1="117" x2="180" y2="123" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          
          {/* Measuring Ticks along vertical crosshair */}
          <line x1="117" y1="60" x2="123" y2="60" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          <line x1="117" y1="90" x2="123" y2="90" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          <line x1="117" y1="150" x2="123" y2="150" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          <line x1="117" y1="180" x2="123" y2="180" stroke="var(--cp-accent)" strokeWidth="1" opacity="0.25" />
          
          {/* Center Point */}
          <circle cx="120" cy="120" r="3" fill="var(--cp-accent)" />
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
          
          <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-accent origin-bottom" />
        </motion.div>
      </div>

      <div className="mt-8 font-mono text-sm text-accent animate-pulse">
        {MESSAGES[msgIndex]}
      </div>
    </div>
  );
}
