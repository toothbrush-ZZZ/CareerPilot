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
  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [newStatus, setNewStatus] = useState<KanbanColumnId>('applied');

  const handleAdd = () => {
    if (!newRole.trim() || !newCompany.trim()) return;
    addCard({
      role: newRole,
      company: newCompany,
      location: newLocation,
      jobUrl: newJobUrl,
      notes: newNotes,
      interviewDate: newInterviewDate ? new Date(newInterviewDate).toISOString() : undefined,
      columnId: newStatus,
      appliedAt: new Date().toISOString()
    });
    setNewRole('');
    setNewCompany('');
    setNewLocation('');
    setNewJobUrl('');
    setNewNotes('');
    setNewInterviewDate('');
    setNewStatus('applied');
    setShowAddForm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowAddForm(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
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
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex justify-end pr-2">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'var(--cp-accent)', color: 'var(--cp-bg)' }}
        >
          + Add Application
        </button>
      </div>

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
                      column.id === 'applied'      ? '#3b82f6'   :
                      column.id === 'interviewing' ? '#eab308' :
                      column.id === 'offer'        ? '#22c55e'     :
                      '#ef4444'
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
              className="flex-1 rounded-[10px] p-3 flex flex-col gap-2.5 min-h-[200px] overflow-y-auto custom-scrollbar"
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

            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>

    {showAddForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div 
          className="rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl"
          style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--cp-text-primary)' }}>New Application</h2>
          
          <div className="flex flex-col gap-3">
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as KanbanColumnId)}
              className="w-full p-2.5 rounded-lg text-sm font-medium outline-none transition-all appearance-none cursor-pointer"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-primary)',
              }}
            >
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              autoFocus
              placeholder="Job title"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-primary)',
              }}
            />
            
            <input
              placeholder="Company"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-primary)',
              }}
            />
            
            <input
              placeholder="Location (Optional)"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2.5 rounded-lg text-xs outline-none transition-all"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-primary)',
              }}
            />
            
            <input
              placeholder="Job URL (Optional)"
              value={newJobUrl}
              onChange={e => setNewJobUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2.5 rounded-lg text-xs outline-none transition-all"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-primary)',
              }}
            />
            
            {newStatus === 'interviewing' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--cp-text-muted)' }}>Interview Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={newInterviewDate}
                  onChange={e => setNewInterviewDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg text-xs outline-none transition-all"
                  style={{
                    background: 'var(--cp-surface)',
                    border: '1px solid var(--cp-border)',
                    color: 'var(--cp-text-primary)',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            )}
            
            <textarea
              placeholder="Notes (Optional)"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg text-xs outline-none resize-none h-20 transition-all custom-scrollbar"
              style={{
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-primary)',
              }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{ color: 'var(--cp-text-muted)', background: 'var(--cp-surface)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newRole.trim() || !newCompany.trim()}
              className="px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: 'var(--cp-accent)', color: 'var(--cp-bg)' }}
            >
              Save Application
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
