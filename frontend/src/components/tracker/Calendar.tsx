'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Calendar({ deadlines = [] }: { deadlines?: { date: string; title: string; color: string }[] }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);
  
  const calendarDays = [];
  for (let i = 0; i < offset; i++) calendarDays.push(null);
  for (let i = 1; i <= days; i++) calendarDays.push(i);
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-white/80">{monthNames[month]} {year}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-white/20 py-2">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, i) => {
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
          const dayDeadlines = deadlines.filter(d => d.date.startsWith(dateStr));
          
          return (
            <div 
              key={i} 
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                day ? "bg-white/5 hover:bg-white/10 cursor-pointer" : "opacity-0 pointer-events-none"
              )}
            >
              <span className={cn("text-sm font-medium", dayDeadlines.length > 0 ? "text-white" : "text-white/40")}>{day}</span>
              {dayDeadlines.length > 0 && (
                <div className="absolute bottom-2 flex gap-0.5">
                  {dayDeadlines.slice(0, 3).map((d, i) => (
                    <div key={i} className={cn("w-1 h-1 rounded-full", d.color)}></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
