"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ to, className, compact }: { to: Date | string | number; className?: string; compact?: boolean }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <span className={cn("inline-block h-6", className)} />;
  if (target <= now) return <span className={cn("text-xs text-white/50", className)}>Offer ended</span>;
  const p = parts(target - now);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (compact) {
    return (
      <span className={cn("font-mono text-xs font-semibold tabular-nums", className)}>
        {p.d > 0 ? `${p.d}d ` : ""}
        {pad(p.h)}:{pad(p.m)}:{pad(p.s)}
      </span>
    );
  }
  return (
    <div className={cn("flex gap-2", className)}>
      {[
        [p.d, "days"],
        [p.h, "hrs"],
        [p.m, "min"],
        [p.s, "sec"],
      ].map(([v, l]) => (
        <div key={l} className="flex min-w-14 flex-col items-center rounded-2xl border border-white/10 bg-ink-950/50 px-2 py-2 backdrop-blur">
          <span className="font-display text-2xl font-bold tabular-nums text-white">{pad(v as number)}</span>
          <span className="text-[10px] tracking-widest text-white/50 uppercase">{l}</span>
        </div>
      ))}
    </div>
  );
}
