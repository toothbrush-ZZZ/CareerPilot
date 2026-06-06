import React, { useState } from 'react';
import { Plus, Target, CheckCircle2, Circle } from 'lucide-react';
import { useTrackerStore } from '@/lib/store/useTrackerStore';
import { Goal } from '@/lib/types';

export function GoalPanel() {
  const { goals, toggleGoal, addGoal } = useTrackerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const handleAdd = () => {
    if (!newGoalText.trim()) return;
    const newGoal: Omit<Goal, 'id'> = {
      text: newGoalText,
      target: 1,
      current: 0,
      completed: false,
      linkedTo: 'general'
    };
    addGoal(newGoal);
    setNewGoalText('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h2
          className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Target size={13} style={{ color: 'var(--hud-blue)' }} />
          Active Goals
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:underline shrink-0"
          style={{ color: 'var(--hud-blue)' }}
        >
          <Plus size={13} /> Add Goal
        </button>
      </div>

      {/* Scrollable goal list */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar h-full items-start">
        {goals.map(goal => (
          <div
            key={goal.id}
            className="w-56 flex-shrink-0 rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all duration-200 hover:shadow-sm"
            style={{
              background: 'var(--bg-panel)',
              border: goal.completed
                ? '1px solid var(--border)'
                : `1px solid var(--border)`,
              borderLeft: !goal.completed ? `2px solid var(--hud-blue)` : `2px solid var(--border)`,
              opacity: goal.completed ? 0.6 : 1,
            }}
            onClick={() => toggleGoal(goal.id)}
          >
            {/* Goal text + check */}
            <div className="flex items-start gap-2">
              {goal.completed
                ? <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--fit-high)' }} />
                : <Circle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
              }
              <span
                className="text-sm font-medium leading-snug"
                style={{
                  color: goal.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: goal.completed ? 'line-through' : undefined,
                }}
              >
                {goal.text}
              </span>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-inset)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                      background: goal.completed ? 'var(--fit-high)' : 'var(--hud-blue)',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-mono flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {goal.current}/{goal.target}
                </span>
              </div>

              {goal.dueDate && (
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Due: {goal.dueDate}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Add new goal card */}
        {isAdding && (
          <div
            className="w-56 flex-shrink-0 rounded-xl p-3.5 flex flex-col gap-2"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--hud-blue)',
            }}
          >
            <input
              type="text"
              autoFocus
              value={newGoalText}
              onChange={e => setNewGoalText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              placeholder="Describe your goal..."
              className="w-full bg-transparent text-sm outline-none"
              style={{
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '4px',
              }}
            />
            <div className="flex gap-3 mt-1">
              <button
                onClick={handleAdd}
                disabled={!newGoalText.trim()}
                className="text-xs font-semibold hover:underline disabled:opacity-40"
                style={{ color: 'var(--hud-blue)' }}
              >
                Save
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
