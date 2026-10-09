import { Stars } from "@/components/ui/Stars";

export function RatingSummary({ summary }: { summary: { total: number; average: number; distribution: { rating: number; count: number }[] } }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="text-center sm:pr-8 sm:text-left">
        <div className="font-display text-7xl font-extrabold text-gradient">{summary.average ? summary.average.toFixed(1) : "–"}</div>
        <Stars value={summary.average} size={18} className="mt-1" />
        <div className="mt-1 text-sm text-white/50">{summary.total} verified reviews</div>
      </div>
      <div className="flex-1 space-y-2">
        {summary.distribution.map((d) => {
          const pct = summary.total ? Math.round((d.count / summary.total) * 100) : 0;
          return (
            <div key={d.rating} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-white/60">{d.rating}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-sunset" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 text-right text-white/45 tabular-nums">{d.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
