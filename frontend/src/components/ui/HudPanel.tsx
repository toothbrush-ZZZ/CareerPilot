import React from 'react';
import { cn } from '@/lib/utils/cn';

interface HudPanelProps {
  children: React.ReactNode;
  title?: string;
  titleRight?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  accent?: boolean;
  id?: string;
}

export function HudPanel({
  children,
  title,
  titleRight,
  className,
  noPadding = false,
  accent = false,
  id,
}: HudPanelProps) {
  return (
    <div
      id={id}
      className={cn(
        'rounded-xl flex flex-col relative overflow-hidden',
        'transition-all duration-200',
        className
      )}
      style={{
        background: 'var(--bg-panel)',
        border: accent
          ? `1px solid var(--border)`
          : `1px solid var(--border)`,
        borderLeft: accent ? `3px solid var(--hud-blue)` : undefined,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 8px rgba(0,0,0,0.03)',
      }}
    >
      {(title || titleRight) && (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-inset)',
          }}
        >
          {title && (
            <h3
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {title}
            </h3>
          )}
          {titleRight && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {titleRight}
            </div>
          )}
        </div>
      )}
      <div className={cn('flex-1', !noPadding && 'p-4')}>
        {children}
      </div>
    </div>
  );
}
