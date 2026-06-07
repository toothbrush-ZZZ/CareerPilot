import React from 'react';
import { Sparkles, ArrowRight, Target, Search, Map, FileText } from 'lucide-react';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  { text: "Am I ready for a data engineer role?",  Icon: Target },
  { text: "What skills am I missing for Google?",  Icon: Search },
  { text: "Build me a 3-month roadmap",            Icon: Map },
  { text: "Draft a cover letter",                  Icon: FileText },
];

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <span
        className="text-[9px] font-bold tracking-widest flex items-center gap-1.5"
        style={{ color: 'var(--cp-text-muted)' }}
      >
        <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
        Suggested queries
      </span>
      <div className="flex flex-col gap-1.5">
        {PROMPTS.map((p, idx) => {
          const Icon = p.Icon;
          return (
            <button
              key={idx}
              onClick={() => onSelect(p.text)}
              className="text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between gap-2 group transition-all"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-secondary)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--cp-border-accent)';
                el.style.background = 'var(--cp-accent-dim)';
                el.style.color = 'var(--cp-text-primary)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--cp-border)';
                el.style.background = 'var(--cp-surface)';
                el.style.color = 'var(--cp-text-secondary)';
              }}
            >
              <span className="flex items-center gap-2 min-w-0">
                <Icon size={16} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--cp-accent)', opacity: 0.75 }} />
                <span className="truncate text-xs leading-snug">{p.text}</span>
              </span>
              <ArrowRight size={16} strokeWidth={1.5} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cp-accent)' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
