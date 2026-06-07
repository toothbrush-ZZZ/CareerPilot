'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X, Sparkles } from 'lucide-react';

interface NudgeCardProps {
  message: string;
  linkText: string;
  linkHref: string;
}

export function NudgeCard({ message, linkText, linkHref }: NudgeCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="rounded-[10px] px-4 py-3 flex items-center justify-between gap-4 transition-all"
      style={{
        background: 'var(--cp-accent-glow)',
        border: '0.5px solid var(--cp-border-accent)',
        borderLeft: '3px solid var(--cp-accent)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles size={16} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--cp-accent)' }} />
        <span className="text-sm font-medium truncate" style={{ color: 'var(--cp-text-primary)' }}>
          {message}
        </span>
        <Link
          href={linkHref}
          className="text-xs font-semibold flex-shrink-0 flex items-center gap-1 hover:underline transition-colors"
          style={{ color: 'var(--cp-accent)' }}
        >
          {linkText} <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="flex-shrink-0 transition-colors"
        style={{ color: 'var(--cp-text-muted)' }}
        aria-label="Dismiss message"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
}
