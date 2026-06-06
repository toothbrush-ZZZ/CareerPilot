import React from 'react';

interface WeeklyActivityProps {
  activity: number[]; // 7 values, Mon-Sun
}

export function WeeklyActivity({ activity }: WeeklyActivityProps) {
  const max = Math.max(...activity, 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div
      className="rounded-xl h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Activity
        </h3>
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          This week
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 px-4 pb-4 pt-3 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-1 h-28">
          {activity.map((val, idx) => {
            const heightPct = val === 0 ? 4 : (val / max) * 100;
            const isWeekend = idx >= 5;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${heightPct}%`,
                      minHeight: '3px',
                      background: val === 0
                        ? 'var(--bg-inset)'
                        : `var(--hud-blue)`,
                      opacity: isWeekend && val === 0 ? 0.5 : val === 0 ? 0.4 : 1,
                      border: val > 0 ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
                    }}
                  />
                </div>
                <span
                  className="text-[9px] font-mono font-semibold"
                  style={{
                    color: val > 0 ? 'var(--hud-blue)' : 'var(--text-muted)',
                    opacity: isWeekend ? 0.7 : 1,
                  }}
                >
                  {days[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
