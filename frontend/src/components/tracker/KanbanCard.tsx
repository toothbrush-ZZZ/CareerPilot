import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApplicationCard } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { Calendar, ExternalLink, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTrackerStore } from '@/lib/store/useTrackerStore';

interface KanbanCardProps {
  card: ApplicationCard;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const { removeCard, moveCard } = useTrackerStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { ...card } });

  const isRejected = card.columnId === 'rejected';
  const [userExpanded, setUserExpanded] = useState(false);
  const isExpanded = isRejected ? userExpanded : true;
  const hasDetails = Boolean(card.notes || card.jobUrl);

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
        "rounded-[8px] px-3 py-2.5 cursor-grab active:cursor-grabbing flex flex-col relative group card-hover border-[1px] border-[var(--cp-border)]",
        isRejected ? "opacity-70 hover:opacity-100" : ""
      )}
    >
      
      <div
        className="absolute top-0 left-0 w-0.5 h-full rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--cp-accent)' }}
      />

      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="kanban__card-title">
          {card.role}
        </h4>
        <div className="flex items-center gap-1">
          <StatusBadge 
            status={card.columnId} 
            className="flex-shrink-0" 
            onChange={(newStatus) => moveCard(card.id, newStatus)}
          />
          <button 
            onClick={(e) => { e.stopPropagation(); removeCard(card.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 rounded-md text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)] transition-colors"
            title="Delete Application"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="kanban__card-company">
        {card.company}
        {card.location && <span className="ml-1 opacity-70">• {card.location}</span>}
      </div>

      {isRejected && hasDetails && (
        <button 
          onClick={(e) => { e.stopPropagation(); setUserExpanded(!userExpanded); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] font-semibold text-[var(--cp-text-muted)] hover:text-[var(--cp-accent)] transition-colors mb-1"
        >
          {userExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {userExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      )}

      {isExpanded && hasDetails && (
        <div className="mt-auto pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--cp-border)' }}>
          {card.jobUrl && (
            <a 
              href={card.jobUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-medium hover:underline w-fit" 
              style={{ color: 'var(--cp-accent)' }}
            >
              View Job <ExternalLink size={12} strokeWidth={1.5} />
            </a>
          )}
          {card.appliedAt && (
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--cp-text-muted)' }}>
              <Calendar size={12} strokeWidth={1.5} /> Applied: {new Date(card.appliedAt).toLocaleDateString()}
            </div>
          )}
          {card.notes && (
            <p className="text-[11px] italic line-clamp-2" style={{ color: 'var(--cp-text-secondary)' }}>
              {card.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
