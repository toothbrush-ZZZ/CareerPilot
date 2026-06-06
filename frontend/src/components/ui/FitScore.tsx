'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface FitScoreProps {
  score: number; // 0–100
  size?: number; // px, default 48
  showLabel?: boolean;
  className?: string;
}

export function FitScore({ score, size = 48, showLabel = false, className }: FitScoreProps) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => { setCurrentScore(score); }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Color by tier
  const color = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';
  const glowColor = score >= 75
    ? 'rgba(5,150,105,0.3)'
    : score >= 50
    ? 'rgba(217,119,6,0.3)'
    : 'rgba(220,38,38,0.3)';

  const strokeWidth = Math.max(2.5, size * 0.09);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentScore / 100) * circumference;

  return (
    <div
      className={cn('relative flex items-center justify-center flex-col', className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track */}
        <circle
          strokeWidth={strokeWidth}
          stroke="var(--border)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress arc */}
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold leading-none"
          style={{ fontSize: size * 0.32, color }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span
          className="text-[9px] uppercase tracking-widest mt-1.5 font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          Fit
        </span>
      )}
    </div>
  );
}
