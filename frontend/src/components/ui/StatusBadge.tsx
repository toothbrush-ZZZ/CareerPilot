import React from 'react';
import { cn } from '@/lib/utils/cn';
import { KanbanColumnId } from '@/lib/types';
import { ChevronDown } from 'lucide-react';

interface StatusBadgeProps {
  status: KanbanColumnId;
  className?: string;
  onChange?: (newStatus: KanbanColumnId) => void;
}

const statusConfig: Record<KanbanColumnId, { label: string; color: string; bg: string; border: string }> = {
  applied:      { label: 'Applied',      color: '#3b82f6', bg: 'transparent', border: '1px solid rgba(59,130,246,0.30)' },
  interviewing: { label: 'Interviewing', color: '#eab308', bg: 'transparent', border: '1px solid rgba(234,179,8,0.30)' },
  offer:        { label: 'Offer',        color: '#22c55e', bg: 'transparent',  border: '1px solid rgba(34,197,94,0.30)' },
  rejected:     { label: 'Rejected',     color: '#ef4444', bg: 'transparent', border: '1px solid rgba(239,68,68,0.30)' },
};

export function StatusBadge({ status, className, onChange }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  if (onChange) {
    return (
      <div 
        className={cn("relative inline-flex items-center", className)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span
          className="inline-flex items-center pl-[6px] pr-[14px] py-[2px] rounded-full text-[9px] font-medium tracking-[-0.01em]"
          style={{
            color: config.color,
            background: config.bg,
            border: config.border,
          }}
        >
          {config.label}
        </span>
        <select
          value={status}
          onChange={(e) => { e.stopPropagation(); onChange(e.target.value as KanbanColumnId); }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
        >
          {Object.entries(statusConfig).map(([key, c]) => (
            <option key={key} value={key}>
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={10} 
          className="absolute right-[4px] pointer-events-none" 
          style={{ color: config.color, opacity: 0.8 }} 
        />
      </div>
    );
  }

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
