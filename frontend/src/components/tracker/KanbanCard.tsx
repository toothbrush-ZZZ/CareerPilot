import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApplicationCard } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { Calendar } from 'lucide-react';

interface KanbanCardProps {
  card: ApplicationCard;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { ...card } });

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
        background: isDragging ? 'var(--bg-inset)' : 'var(--bg-panel)',
        border: `1px solid var(--border)`,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      {...attributes}
      {...listeners}
      role="article"
      aria-label={`${card.role} at ${card.company}`}
      className="rounded-lg p-3 cursor-grab active:cursor-grabbing flex flex-col gap-2 relative group transition-all duration-150 hover:shadow-sm"
    >
      {/* Left accent stripe on hover */}
      <div
        className="absolute top-0 left-0 w-0.5 h-full rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--hud-blue)' }}
      />

      <div className="flex items-start justify-between gap-2">
        <h4
          className="text-sm font-semibold leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {card.role}
        </h4>
        <StatusBadge status={card.columnId} className="flex-shrink-0" />
      </div>

      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {card.company}
      </div>

      {(card.notes || card.deadline) && (
        <div
          className="mt-1 pt-2 flex flex-col gap-1"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {card.deadline && (
            <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={10} /> Deadline: {card.deadline}
            </div>
          )}
          {card.notes && (
            <p className="text-[10px] italic line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              {card.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
