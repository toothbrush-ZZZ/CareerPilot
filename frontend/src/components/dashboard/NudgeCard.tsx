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
      className="rounded-xl px-4 py-3 flex items-center justify-between gap-4 transition-all"
      style={{
        background: 'var(--hud-blue-glow)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderLeft: '3px solid var(--hud-blue)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles size={14} className="flex-shrink-0" style={{ color: 'var(--hud-blue)' }} />
        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {message}
        </span>
        <Link
          href={linkHref}
          className="text-xs font-semibold flex-shrink-0 flex items-center gap-1 hover:underline transition-colors"
          style={{ color: 'var(--hud-blue)' }}
        >
          {linkText} <ArrowRight size={12} />
        </Link>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="flex-shrink-0 transition-colors"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
