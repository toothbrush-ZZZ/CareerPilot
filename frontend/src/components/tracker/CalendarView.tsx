import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { useTrackerStore } from '@/lib/store/useTrackerStore';

export function CalendarView() {
  const { goals, toggleGoal } = useTrackerStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const today = new Date();
  
  const getGoalsForDay = (day: number) => {
    const targetDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return goals.filter(g => g.dueDate && g.dueDate.startsWith(targetDateStr));
  };

  return (
    <div className="flex flex-col h-full rounded-xl" style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}>
      
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--cp-border)' }}>
        <h2 className="text-xs font-semibold tracking-widest flex items-center gap-2" style={{ color: 'var(--cp-text-secondary)' }}>
          <CalendarIcon size={20} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
          Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-[var(--cp-surface)] transition-colors" style={{ color: 'var(--cp-text-muted)' }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold min-w-[100px] text-center" style={{ color: 'var(--cp-text-primary)' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-[var(--cp-surface)] transition-colors" style={{ color: 'var(--cp-text-muted)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      
      <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar">
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-semibold tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        
        <div className="grid grid-cols-7 gap-1 flex-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[60px] rounded-md opacity-20" style={{ background: 'var(--cp-surface)' }} />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
            const dayGoals = getGoalsForDay(day);
            
            return (
              <div 
                key={day} 
                className="min-h-[60px] rounded-md p-1.5 flex flex-col gap-1 transition-colors hover:bg-[var(--cp-surface)]"
                style={{ 
                  background: isToday ? 'var(--cp-accent-glow)' : 'transparent',
                  border: isToday ? '1px solid var(--cp-border-accent)' : '1px solid var(--cp-border)',
                }}
              >
                <div 
                  className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--cp-accent)] text-black' : ''}`}
                  style={{ color: isToday ? '#000' : 'var(--cp-text-secondary)' }}
                >
                  {day}
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                  {dayGoals.map(goal => (
                    <div 
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className="text-[9px] leading-tight px-1 py-0.5 rounded cursor-pointer truncate transition-opacity hover:opacity-80"
                      style={{ 
                        background: goal.completed ? 'var(--cp-surface)' : 'var(--cp-accent-dim)',
                        color: goal.completed ? 'var(--cp-text-muted)' : 'var(--cp-accent)',
                        textDecoration: goal.completed ? 'line-through' : 'none'
                      }}
                      title={goal.text}
                    >
                      {goal.text}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
