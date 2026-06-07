import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApplicationCard } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTrackerStore } from '@/lib/store/useTrackerStore';

interface KanbanCardProps {
  card: ApplicationCard;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const { removeCard } = useTrackerStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { ...card } });

  const isRejected = card.columnId === 'rejected';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? 'var(--cp-surface)' : 'var(--cp-card)',
        boxShadow: isDragging ? '0 8px 24px var(--cp-border)' : '0 1px 3px var(--cp-border)',
      }}
      {...attributes}
      {...listeners}
      role="article"
      aria-label={`${card.role} at ${card.company}`}
      className={cn(
        "rounded-[10px] px-[14px] py-[12px] cursor-grab active:cursor-grabbing flex flex-col relative group card-hover border-[1px] border-[var(--cp-border)] min-h-[140px]",
        isRejected ? "opacity-70 hover:opacity-100" : ""
      )}
    >
      
      <div
        className="absolute top-0 left-0 w-0.5 h-full rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--cp-accent)' }}
      />

      <div className="flex items-start justify-between gap-2 mb-1">
        <h4
          className="font-semibold leading-tight text-sm"
          style={{ color: 'var(--cp-text-primary)' }}
        >
          {card.role}
        </h4>
        <div className="flex items-center gap-1">
          <StatusBadge status={card.columnId} className="flex-shrink-0" />
          <button 
            onClick={(e) => { e.stopPropagation(); removeCard(card.id); }}
            className="p-1 rounded-md text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)] transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Application"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-[11px] mb-3" style={{ color: 'var(--cp-text-muted)' }}>
        {card.company}
        {card.location && <span className="ml-1 opacity-70">• {card.location}</span>}
      </div>

      <div className="mt-auto pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--cp-border)' }}>
        {(card.notes || card.deadline || card.jobUrl) ? (
          <>
            {card.jobUrl && (
              <a href={card.jobUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-medium hover:underline w-fit" style={{ color: 'var(--cp-accent)' }}>
                View Job <ExternalLink size={12} strokeWidth={1.5} />
              </a>
            )}
            {card.deadline && (
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--cp-text-muted)' }}>
                <Calendar size={12} strokeWidth={1.5} /> Deadline: {card.deadline}
              </div>
            )}
            {card.notes && (
              <p className="text-[11px] italic line-clamp-2" style={{ color: 'var(--cp-text-secondary)' }}>
                {card.notes}
              </p>
            )}
          </>
        ) : (
          <div className="h-[20px] w-full" /> /* Invisible placeholder to enforce consistent gap slot */
        )}
      </div>
    </div>
  );
}
