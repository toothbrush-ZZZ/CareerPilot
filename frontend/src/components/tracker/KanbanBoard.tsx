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
  const [newLocation, setNewLocation] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAdd = () => {
    if (!newRole.trim() || !newCompany.trim()) return;
    addCard({
      role: newRole,
      company: newCompany,
      location: newLocation,
      jobUrl: newJobUrl,
      notes: newNotes,
      columnId: 'applied',
      appliedAt: new Date().toISOString()
    });
    setNewRole('');
    setNewCompany('');
    setNewLocation('');
    setNewJobUrl('');
    setNewNotes('');
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

  const handleDragOver = () => {
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    let targetColumnId: KanbanColumnId | null = null;
    
    const isOverAColumn = columns.find(col => col.id === overId);
    if (isOverAColumn) {
      targetColumnId = overId as KanbanColumnId;
    } else {
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
          <div key={column.id} className="flex flex-col flex-1 min-w-[220px] max-w-[300px] flex-shrink-0 snap-start">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[11px] font-medium tracking-[-0.01em] flex items-center gap-2" style={{ color: 'var(--cp-text-secondary)' }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      column.id === 'applied'      ? '#8888a8'   :
                      column.id === 'interviewing' ? '#c8a96e' :
                      column.id === 'offer'        ? '#4ade80'     :
                      '#9a7a7a'
                  }}
                />
                {column.label}
              </h3>
              <span
                className="text-[11px] font-medium px-2 py-[1px] rounded-full"
                style={{
                  background: 'var(--cp-surface)',
                  border: '0.5px solid var(--cp-border)',
                  color: 'var(--cp-text-muted)',
                }}
              >
                {column.cards.length}
              </span>
            </div>

            <div
              id={column.id}
              className="flex-1 rounded-[10px] p-3 flex flex-col gap-2.5 min-h-[200px]"
              style={{ background: 'var(--cp-surface)', border: '0.5px solid var(--cp-border)' }}
            >
              <SortableContext
                id={column.id}
                items={column.cards.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {column.cards.length === 0 && (
                  <div 
                    className="flex flex-col items-center justify-center flex-1 min-h-[140px] rounded-[10px] border border-dashed transition-colors"
                    style={{ borderColor: 'var(--cp-border)', background: 'transparent' }}
                  >
                    <p className="text-[11px] font-medium tracking-[-0.01em]" style={{ color: 'var(--cp-text-muted)', opacity: 0.7 }}>
                      No applications yet
                    </p>
                  </div>
                )}
                {column.cards.map((card) => (
                  <KanbanCard key={card.id} card={card} />
                ))}
              </SortableContext>

              {column.id === 'applied' && !showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-1 w-full py-2 rounded-[8px] text-xs font-semibold transition-all hover:bg-[var(--cp-accent-dim)]"
                  style={{
                    border: '0.5px solid var(--cp-accent-glow)',
                    color: 'var(--cp-accent)',
                  }}
                >
                  Add application
                </button>
              )}
              {column.id === 'applied' && showAddForm && (
                <div
                  className="rounded-[8px] p-3 mt-1 space-y-2"
                  style={{ background: 'var(--cp-card)', border: '0.5px solid var(--cp-border)' }}
                >
                  <input
                    autoFocus
                    placeholder="Job title"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm outline-none pb-1 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--cp-border)',
                      color: 'var(--cp-text-primary)',
                    }}
                  />
                  <input
                    placeholder="Company"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm outline-none pb-1 mt-2 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--cp-border)',
                      color: 'var(--cp-text-primary)',
                    }}
                  />
                  <input
                    placeholder="Location (Optional)"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-xs outline-none pb-1 mt-2 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--cp-border)',
                      color: 'var(--cp-text-primary)',
                    }}
                  />
                  <input
                    placeholder="Job URL (Optional)"
                    value={newJobUrl}
                    onChange={e => setNewJobUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-xs outline-none pb-1 mt-2 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--cp-border)',
                      color: 'var(--cp-text-primary)',
                    }}
                  />
                  <textarea
                    placeholder="Notes (Optional)"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none pb-1 mt-2 resize-none h-12 transition-colors custom-scrollbar"
                    style={{
                      borderBottom: '1px solid var(--cp-border)',
                      color: 'var(--cp-text-primary)',
                    }}
                  />
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleAdd}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: 'var(--cp-accent)' }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-xs transition-colors"
                      style={{ color: 'var(--cp-text-muted)' }}
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
