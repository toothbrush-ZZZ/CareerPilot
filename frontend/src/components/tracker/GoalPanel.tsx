import React, { useState } from 'react';
import { Plus, Target, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useTrackerStore } from '@/lib/store/useTrackerStore';
import { Goal } from '@/lib/types';

export function GoalPanel() {
  const { goals, toggleGoal, addGoal, removeGoal } = useTrackerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  const handleAdd = () => {
    if (!newGoalText.trim()) return;
    const newGoal: Omit<Goal, 'id'> = {
      text: newGoalText,
      target: 1,
      current: 0,
      completed: false,
      linkedTo: 'general',
      dueDate: newGoalDate || undefined
    };
    addGoal(newGoal);
    setNewGoalText('');
    setNewGoalDate('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      
      <div className="flex items-center justify-between shrink-0">
        <h2
          className="text-[11px] font-medium tracking-[-0.01em] flex items-center gap-2"
          style={{ color: 'var(--cp-text-secondary)' }}
        >
          <Target size={20} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
          Active goals
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:underline shrink-0"
          style={{ color: 'var(--cp-accent)' }}
        >
          <Plus size={16} strokeWidth={1.5} /> Add goal
        </button>
      </div>

      
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar h-full items-start">
        {goals.map(goal => (
          <div
            key={goal.id}
            className="w-56 flex-shrink-0 rounded-[10px] p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all duration-200 group"
            style={{
              background: 'var(--cp-card)',
              border: goal.completed
                ? '1px solid var(--cp-border)'
                : `1px solid var(--cp-border)`,
              borderLeft: !goal.completed ? `2px solid var(--cp-accent)` : `2px solid var(--cp-border)`,
              opacity: goal.completed ? 0.6 : 1,
            }}
            onClick={() => toggleGoal(goal.id)}
          >
            
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                {goal.completed
                  ? <CheckCircle2 size={16} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--cp-accent)' }} />
                  : <Circle size={16} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--cp-text-muted)' }} />
                }
                <span
                  className="text-sm font-medium leading-snug break-words"
                  style={{
                    color: goal.completed ? 'var(--cp-text-muted)' : 'var(--cp-text-primary)',
                    textDecoration: goal.completed ? 'line-through' : undefined,
                  }}
                >
                  {goal.text}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeGoal(goal.id); }}
                className="p-1 -mr-1 -mt-1 rounded-md text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Delete Goal"
              >
                <Trash2 size={14} />
              </button>
            </div>

            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="min-h-[4px] flex-1 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                      background: 'var(--cp-accent)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-mono flex-shrink-0"
                  style={{ color: 'var(--cp-text-muted)' }}
                >
                  {goal.current}/{goal.target}
                </span>
              </div>

              {goal.dueDate && (
                <span className="text-[10px] font-mono" style={{ color: 'var(--cp-text-muted)' }}>
                  Due: {goal.dueDate}
                </span>
              )}
            </div>
          </div>
        ))}

        
        {isAdding && (
          <div
            className="w-56 flex-shrink-0 rounded-[10px] p-3.5 flex flex-col gap-2"
            style={{
              background: 'var(--cp-card)',
              border: '1px solid var(--cp-accent)',
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
                color: 'var(--cp-text-primary)',
                borderBottom: '1px solid var(--cp-border)',
                paddingBottom: '4px',
              }}
            />
            <input
              type="date"
              value={newGoalDate}
              onChange={e => setNewGoalDate(e.target.value)}
              className="w-full bg-transparent text-xs outline-none mt-2"
              style={{
                color: 'var(--cp-text-secondary)',
                borderBottom: '1px solid var(--cp-border)',
                paddingBottom: '4px',
              }}
            />
            <div className="flex gap-3 mt-1">
              <button
                onClick={handleAdd}
                disabled={!newGoalText.trim()}
                className="text-xs font-semibold hover:underline disabled:opacity-40"
                style={{ color: 'var(--cp-accent)' }}
              >
                Save goal
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs"
                style={{ color: 'var(--cp-text-muted)' }}
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
