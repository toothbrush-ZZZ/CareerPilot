import React from 'react';
import { cn } from '@/lib/utils/cn';
import { KanbanColumnId } from '@/lib/types';

interface StatusBadgeProps {
  status: KanbanColumnId;
  className?: string;
}

const statusConfig: Record<KanbanColumnId, { label: string; color: string; bg: string; border: string }> = {
  applied:      { label: 'Applied',      color: 'var(--status-applied)',   bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.3)' },
  interviewing: { label: 'Interviewing', color: 'var(--status-interview)', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.3)' },
  offer:        { label: 'Offer',        color: 'var(--status-offer)',      bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.3)' },
  rejected:     { label: 'Rejected',     color: 'var(--status-rejected)',   bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.3)' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider',
        className
      )}
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}
