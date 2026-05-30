'use client';

interface HeatmapChartProps {
  data: number[][]; // 7 days × 24 hours
  label: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensityClass(value: number, max: number): string {
  if (max === 0) return 'bg-card';
  const ratio = value / max;
  if (ratio === 0) return 'bg-slate-800';
  if (ratio < 0.125) return 'bg-emerald-900';
  if (ratio < 0.25) return 'bg-emerald-800';
  if (ratio < 0.375) return 'bg-emerald-700';
  if (ratio < 0.5) return 'bg-emerald-600';
  if (ratio < 0.625) return 'bg-emerald-500';
  if (ratio < 0.75) return 'bg-emerald-400';
  return 'bg-emerald-300';
}

export default function HeatmapChart({ data, label }: HeatmapChartProps) {
  const max = Math.max(...data.flat(), 1);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="text-sm font-medium text-muted mb-3">{label}</h3>
      <div className="overflow-x-auto">
        <div className="inline-grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 min-w-[600px]">
          {/* Header row: hour labels */}
          <div className="w-10" />
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="text-[10px] text-muted text-center leading-5"
            >
              {h}
            </div>
          ))}

          {/* Data rows */}
          {DAY_LABELS.map((day, d) => (
            <>
              <div
                key={`label-${day}`}
                className="text-[10px] text-muted text-right pr-1.5 leading-5"
              >
                {day}
              </div>
              {Array.from({ length: 24 }, (_, h) => {
                const val = data[d]?.[h] ?? 0;
                return (
                  <div
                    key={`${day}-${h}`}
                    className={`w-full aspect-square rounded-sm ${getIntensityClass(val, max)}`}
                    title={`${day} ${h}:00 — ${val} messages`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-muted">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-800" />
        <div className="w-3 h-3 rounded-sm bg-emerald-900" />
        <div className="w-3 h-3 rounded-sm bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <div className="w-3 h-3 rounded-sm bg-emerald-300" />
        <span>More</span>
      </div>
    </div>
  );
}
