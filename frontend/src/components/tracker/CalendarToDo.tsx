import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Plus } from 'lucide-react';
import { useTrackerStore } from '@/lib/store/useTrackerStore';
import { Goal } from '@/lib/types';

export function CalendarToDo() {
  const { goals, addGoal, toggleGoal } = useTrackerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Sort goals by due date, pushing those without dates to the bottom
  const tasks = [...goals].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleAdd = async () => {
    if (!newTaskText.trim()) return;
    
    await addGoal({
      text: newTaskText,
      target: 1,
      current: 0,
      completed: false,
      dueDate: newDueDate || undefined,
      linkedTo: 'general'
    });
    
    setNewTaskText('');
    setNewDueDate('');
    setIsAdding(false);
  };

  const getDayName = (dateStr?: string) => {
    if (!dateStr) return 'Someday';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <CalendarIcon size={13} style={{ color: 'var(--hud-blue)' }} />
          Agenda & To-Dos
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:underline"
          style={{ color: 'var(--hud-blue)' }}
        >
          <Plus size={13} /> Add Task
        </button>
      </div>

      <div className="flex-1 rounded-xl p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        
        {isAdding && (
          <div className="mb-2 p-3 rounded-lg border border-dashed border-[var(--hud-blue)] space-y-3">
            <input
              type="text"
              autoFocus
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="E.g., Complete DSA module"
              className="w-full bg-transparent text-sm outline-none border-b border-[var(--border)] pb-1"
              style={{ color: 'var(--text-primary)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="bg-transparent text-xs outline-none flex-1 border-b border-[var(--border)] pb-1"
                style={{ color: 'var(--text-secondary)' }}
              />
              <button
                onClick={handleAdd}
                disabled={!newTaskText.trim()}
                className="text-xs font-semibold hover:underline disabled:opacity-40"
                style={{ color: 'var(--hud-blue)' }}
              >
                Save
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !isAdding && (
          <div className="text-center py-6 text-sm italic opacity-50" style={{ color: 'var(--text-muted)' }}>
            No tasks scheduled.
          </div>
        )}

        {tasks.map(task => (
          <div 
            key={task.id}
            className="flex items-start gap-3 p-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]"
            style={{ 
              opacity: task.completed ? 0.5 : 1,
              borderLeft: !task.completed && task.dueDate && new Date(task.dueDate) <= new Date() ? '2px solid var(--status-rejected)' : '2px solid transparent'
            }}
          >
            <button onClick={() => toggleGoal(task.id)} className="mt-0.5 flex-shrink-0">
              {task.completed ? (
                <CheckCircle2 size={16} style={{ color: 'var(--fit-high)' }} />
              ) : (
                <Circle size={16} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
            <div className="flex flex-col flex-1 min-w-0">
              <span 
                className="text-sm font-medium truncate" 
                style={{ 
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}
              >
                {task.text}
              </span>
              <span className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                {getDayName(task.dueDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
