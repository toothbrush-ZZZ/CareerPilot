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
      
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--cp-border)' }}>
        <h2 className="section__heading flex items-center gap-1.5">
          <CalendarIcon size={14} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
          Calendar
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="calendar__nav-arrow p-0.5 rounded hover:bg-[var(--cp-surface)] transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="calendar__month-title min-w-[70px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="calendar__nav-arrow p-0.5 rounded hover:bg-[var(--cp-surface)] transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      
      <div className="flex-1 flex flex-col p-2 overflow-visible">
        
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar__weekday text-center">
              {d}
            </div>
          ))}
        </div>

        
        <div className="grid grid-cols-7 gap-1 flex-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[28px]" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
            const dayGoals = getGoalsForDay(day);
            const hasGoals = dayGoals.length > 0;
            const hasIncompleteGoals = dayGoals.some(g => !g.completed);
            
            return (
              <div 
                key={day} 
                className="relative group min-h-[28px] p-1 flex flex-col items-center justify-center cursor-default"
              >
                <div 
                  className={`flex flex-col items-center justify-center transition-all ${
                    isToday ? 'calendar__day--today' : 
                    hasIncompleteGoals ? 'calendar__day--highlighted' : 
                    'calendar__day'
                  } ${hasGoals ? 'cursor-pointer hover:bg-[var(--cp-surface)] calendar__day--has-event' : ''}`}
                >
                  {day}
                </div>
                
                {hasGoals && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col pb-1.5 z-[100]">
                    <div className="flex flex-col gap-2 p-4 rounded-xl shadow-xl w-max max-w-[280px]"
                         style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                      <div className="text-sm font-bold text-[var(--cp-text-muted)] mb-1 uppercase tracking-wider text-center">
                        Due on {day}
                      </div>
                      {dayGoals.map(goal => (
                        <div 
                          key={goal.id}
                          onClick={(e) => { e.stopPropagation(); toggleGoal(goal.id); }}
                          className={`text-sm leading-snug px-3 py-2 rounded cursor-pointer truncate transition-colors ${
                            goal.completed 
                              ? 'bg-[var(--cp-surface)] text-[var(--cp-text-muted)] line-through' 
                              : 'bg-[var(--cp-surface)] text-[var(--cp-text-primary)] hover:bg-[var(--cp-accent)] hover:text-black'
                          }`}
                        >
                          {goal.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
