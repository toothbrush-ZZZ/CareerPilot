import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTrackerStore } from '@/lib/store/useTrackerStore';

export function JobStatusChart() {
  const { columns } = useTrackerStore();
  
  const data = columns.map(col => ({
    name: col.label,
    value: col.cards.length,
    color: col.id === 'applied' ? '#3b82f6' :
           col.id === 'interviewing' ? '#eab308' :
           col.id === 'offer' ? '#22c55e' : '#ef4444'
  })).filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full bg-[var(--cp-card)] rounded-[10px] border border-[var(--cp-border)] p-5 flex flex-col">
      <h3 className="text-xs font-semibold mb-2 text-[var(--cp-text-muted)] tracking-widest uppercase">Job Status Breakdown</h3>
      <div className="flex-1 min-h-0 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--cp-surface)', border: '1px solid var(--cp-border)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: 'var(--cp-text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: 'var(--cp-text-secondary)', paddingLeft: '32px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
