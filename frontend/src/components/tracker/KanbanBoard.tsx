'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTrackerStore } from '@/lib/store/useTrackerStore';
import { KanbanCard } from './KanbanCard';
import { ApplicationCard, KanbanColumnId } from '@/lib/types';

export function KanbanBoard() {
  const { columns, moveCard, addCard } = useTrackerStore();
  const [activeCard, setActiveCard] = useState<ApplicationCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');

  const handleAdd = () => {
    if (!newRole.trim() || !newCompany.trim()) return;
    addCard({
      role: newRole,
      company: newCompany,
      columnId: 'applied',
      appliedAt: new Date().toISOString()
    });
    setNewRole('');
    setNewCompany('');
    setShowAddForm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowAddForm(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    setActiveCard(data.current as ApplicationCard);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Basic implementation relies on DragEnd for column movement in this simplified version
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropping over a column or another card
    let targetColumnId: KanbanColumnId | null = null;
    
    const isOverAColumn = columns.find(col => col.id === overId);
    if (isOverAColumn) {
      targetColumnId = overId as KanbanColumnId;
    } else {
      // Find which column the target card belongs to
      for (const col of columns) {
        if (col.cards.find(c => c.id === overId)) {
          targetColumnId = col.id;
          break;
        }
      }
    }

    if (targetColumnId && activeCard && activeCard.columnId !== targetColumnId) {
      moveCard(activeId, targetColumnId);
    }

    setActiveCard(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory h-full custom-scrollbar">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col min-w-[260px] sm:w-80 flex-shrink-0 snap-start">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      column.id === 'applied'      ? 'var(--status-applied)'   :
                      column.id === 'interviewing' ? 'var(--status-interview)' :
                      column.id === 'offer'        ? 'var(--status-offer)'     :
                      'var(--status-rejected)'
                  }}
                />
                {column.label}
              </h3>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-md"
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {column.cards.length}
              </span>
            </div>

            <div
              id={column.id}
              className="flex-1 rounded-xl p-3 flex flex-col gap-2.5 min-h-[200px]"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
            >
              <SortableContext
                id={column.id}
                items={column.cards.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {column.cards.length === 0 && (
                  <p className="text-xs text-center mt-4 italic" style={{ color: 'var(--text-muted)' }}>No applications yet</p>
                )}
                {column.cards.map((card) => (
                  <KanbanCard key={card.id} card={card} />
                ))}
              </SortableContext>

              {column.id === 'applied' && !showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-1 w-full py-2 rounded-lg text-xs transition-colors"
                  style={{
                    border: '1px dashed var(--border)',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--hud-blue)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--hud-blue)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                >
                  + Add Application
                </button>
              )}
              {column.id === 'applied' && showAddForm && (
                <div
                  className="rounded-lg p-3 mt-1 space-y-2"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
                >
                  <input
                    autoFocus
                    placeholder="Job title"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm outline-none pb-1 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <input
                    placeholder="Company"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm outline-none pb-1 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleAdd}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: 'var(--hud-blue)' }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-xs transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
