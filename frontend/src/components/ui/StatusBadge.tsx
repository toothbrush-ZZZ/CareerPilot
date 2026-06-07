import React from 'react';
import { cn } from '@/lib/utils/cn';
import { KanbanColumnId } from '@/lib/types';

interface StatusBadgeProps {
  status: KanbanColumnId;
  className?: string;
}

const statusConfig: Record<KanbanColumnId, { label: string; color: string; bg: string; border: string }> = {
  applied:      { label: 'Applied',      color: '#8888a8', bg: 'rgba(136,136,168,0.10)', border: '1px solid rgba(136,136,168,0.20)' },
  interviewing: { label: 'Interviewing', color: '#c8a96e', bg: 'rgba(200,169,110,0.10)', border: '1px solid rgba(200,169,110,0.20)' },
  offer:        { label: 'Offer',        color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: '1px solid rgba(74,222,128,0.20)' },
  rejected:     { label: 'Rejected',     color: '#9a7a7a', bg: 'rgba(154,122,122,0.08)', border: '1px solid rgba(154,122,122,0.18)' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-medium tracking-[-0.01em]',
        className
      )}
      style={{
        color: config.color,
        background: config.bg,
        border: config.border,
      }}
    >
      {config.label}
    </span>
  );
}
