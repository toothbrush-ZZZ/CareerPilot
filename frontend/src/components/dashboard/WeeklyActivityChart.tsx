import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useRouter } from 'next/navigation';

interface Props {
  activity: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export function WeeklyActivityChart({ activity }: Props) {
  const router = useRouter();
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const currentDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday...
  const mappedCurrentDay = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // 0 = Mon... 6 = Sun

  const data = activity.map((val, idx) => ({
    name: days[idx],
    fullName: fullDays[idx],
    count: val,
    isToday: idx === mappedCurrentDay,
    isFuture: idx > mappedCurrentDay
  }));

  const total = activity.reduce((a, b) => a + b, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { count, fullName } = payload[0].payload;
      return (
        <div className="px-3 py-2 rounded-lg shadow-xl text-xs font-medium" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-primary)' }}>
          {count} application{count !== 1 ? 's' : ''} — {fullName}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full rounded-xl p-5" style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--cp-text-primary)' }}>Weekly Activity</h3>
      
      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--cp-text-muted)' }}>No applications logged yet this week</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[120px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={24}>
              <XAxis 
                dataKey="fullName" 
                tickFormatter={(val) => val.charAt(0)}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--cp-text-muted)' }} 
                dy={10}
              />
              <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 4, 4]} 
                onClick={() => router.push('/tracker')}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? 'var(--cp-accent)' : entry.isFuture ? 'transparent' : 'var(--cp-border)'} 
                    stroke={entry.isFuture ? 'var(--cp-border)' : 'none'}
                    strokeDasharray={entry.isFuture ? '2 2' : 'none'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
