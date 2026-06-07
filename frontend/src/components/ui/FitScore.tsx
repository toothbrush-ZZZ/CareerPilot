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

  const color = score >= 75 ? 'var(--cp-accent)' : score >= 50 ? 'var(--cp-gold)' : 'var(--cp-danger)';
  const glowColor = 'var(--cp-border-accent)';

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
        
        <circle
          strokeWidth={strokeWidth}
          stroke="var(--cp-border)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
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
          className="text-[11px] font-medium tracking-[-0.01em] mt-1.5"
          style={{ color: 'var(--cp-text-muted)' }}
        >
          Fit
        </span>
      )}
    </div>
  );
}
