"use client";

import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { themes } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  destinations: { slug: string; name: string; region: string }[];
  bounds: { min: number; max: number };
};

const durations = [
  ["1-4", "Up to 4 days"],
  ["5-7", "5 – 7 days"],
  ["8-10", "8 – 10 days"],
  ["11-30", "11+ days"],
];

export function useFilterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const set = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false }));
  };
  return { params, set, pending, reset: () => start(() => router.push(pathname, { scroll: false })) };
}

function FilterBody({ destinations, bounds, onDone }: Props & { onDone?: () => void }) {
  const { params, set, reset } = useFilterNav();
  const { formatPrice } = useApp();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [max, setMax] = useState(Number(params.get("maxPrice")) || bounds.max);

  useEffect(() => setQ(params.get("q") ?? ""), [params]);
  useEffect(() => setMax(Number(params.get("maxPrice")) || bounds.max), [params, bounds.max]);

  const type = params.get("type") ?? "";
  const theme = params.get("theme") ?? "";
  const duration = params.get("duration") ?? "";
  const group = params.get("group") === "1";

  return (
    <div className="space-y-7">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          set({ q });
          onDone?.();
        }}
        className="relative"
      >
        <Search size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trips, cities…" className="field !pl-11" aria-label="Search packages" />
      </form>

      <div>
        <div className="label">Trip type</div>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white/[0.04] p-1.5">
          {[
            ["", "All"],
            ["domestic", "India"],
            ["international", "Abroad"],
          ].map(([v, l]) => (
            <button key={v} onClick={() => set({ type: v, destination: null })} className={cn("rounded-xl py-2 text-sm font-semibold transition", type === v ? "bg-sunset text-ink-950" : "text-white/60 hover:text-white")}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="f-dest">
          Destination
        </label>
        <select id="f-dest" className="field" value={params.get("destination") ?? ""} onChange={(e) => set({ destination: e.target.value })}>
          <option value="">All destinations</option>
          {destinations
            .filter((d) => !type || d.region === type)
            .map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <div className="label">Travel style</div>
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => set({ theme: theme === t.id ? null : t.id })}
              className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", theme === t.id ? "border-sun-400 bg-sun-400/15 text-sun-200" : "border-white/10 text-white/65 hover:border-white/30 hover:text-white")}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="label">Duration</div>
        <div className="grid grid-cols-2 gap-2">
          {durations.map(([v, l]) => (
            <button
              key={v}
              onClick={() => set({ duration: duration === v ? null : v })}
              className={cn("rounded-xl border px-3 py-2 text-xs font-medium transition", duration === v ? "border-aqua-400 bg-aqua-400/15 text-aqua-300" : "border-white/10 text-white/65 hover:border-white/30")}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label !mb-0">Max budget / person</span>
          <span className="text-sm font-bold text-sun-300">{max >= bounds.max ? "Any" : formatPrice(max)}</span>
        </div>
        <input
          type="range"
          min={Math.floor(bounds.min / 5000) * 5000}
          max={bounds.max}
          step={5000}
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          onPointerUp={() => set({ maxPrice: max >= bounds.max ? null : String(max) })}
          onKeyUp={() => set({ maxPrice: max >= bounds.max ? null : String(max) })}
          className="w-full accent-[#ff8a3d]"
          aria-label="Maximum budget"
        />
        <div className="mt-1 flex justify-between text-[11px] text-white/40">
          <span>{formatPrice(bounds.min)}</span>
          <span>{formatPrice(bounds.max)}</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <span>
          <span className="block text-sm font-semibold">Group tours only</span>
          <span className="text-xs text-white/50">Fixed departures with a tour leader</span>
        </span>
        <input type="checkbox" checked={group} onChange={(e) => set({ group: e.target.checked ? "1" : null })} className="h-5 w-5 accent-[#3fe6c9]" />
      </label>

      <button
        onClick={() => {
          reset();
          onDone?.();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-2.5 text-sm text-white/60 transition hover:text-white"
      >
        <RotateCcw size={14} /> Reset all filters
      </button>
    </div>
  );
}

export function Filters(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="hidden lg:block">
        <div className="card sticky top-28 p-6" data-lenis-prevent>
          <div className="mb-6 flex items-center gap-2 font-display text-lg font-bold">
            <SlidersHorizontal size={18} className="text-sun-400" /> Filters
          </div>
          <FilterBody {...props} />
        </div>
      </aside>
      <button onClick={() => setOpen(true)} className="btn-ghost glass-strong fixed bottom-5 left-4 z-40 shadow-2xl lg:hidden">
        <SlidersHorizontal size={16} /> Filters
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/70 backdrop-blur" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              className="glass-strong absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[2rem] p-6"
              data-lenis-prevent
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-xl font-bold">Filters</span>
                <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-2" aria-label="Close filters">
                  <X size={18} />
                </button>
              </div>
              <FilterBody {...props} onDone={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SortSelect() {
  const { params, set, pending } = useFilterNav();
  return (
    <div className="flex items-center gap-3">
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-sun-400 border-t-transparent" />}
      <select value={params.get("sort") ?? ""} onChange={(e) => set({ sort: e.target.value })} className="field !w-auto !rounded-full !py-2.5" aria-label="Sort packages">
        <option value="">Most popular</option>
        <option value="rating">Top rated</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="duration">Shortest first</option>
      </select>
    </div>
  );
}

export function ActiveFilterChips({ labels }: { labels: { key: string; label: string }[] }) {
  const { set } = useFilterNav();
  if (!labels.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l) => (
        <button key={l.key} onClick={() => set({ [l.key]: null })} className="chip transition hover:border-coral-400/50 hover:text-white">
          {l.label} <X size={12} />
        </button>
      ))}
    </div>
  );
}
