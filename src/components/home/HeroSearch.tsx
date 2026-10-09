"use client";

import { CalendarDays, Globe2, MapPin, Search, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Suggestion = { label: string; sub: string; href: string };

const budgets = [
  { label: "Any budget", value: "" },
  { label: "Under ₹25k", value: "25000" },
  { label: "Under ₹50k", value: "50000" },
  { label: "Under ₹1 Lakh", value: "100000" },
  { label: "Luxury (₹1L+)", value: "lux" },
];

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSugs([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await r.json();
        setSugs([
          ...data.destinations.map((d: { slug: string; name: string; country: string }) => ({ label: d.name, sub: d.country, href: `/destinations/${d.slug}` })),
          ...data.packages.slice(0, 3).map((p: { slug: string; title: string; days: number }) => ({ label: p.title, sub: `${p.days} days`, href: `/packages/${p.slug}` })),
        ]);
        setOpen(true);
      } catch {
        /* aborted */
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type);
    if (duration) p.set("duration", duration);
    if (budget === "lux") p.set("minPrice", "100000");
    else if (budget) p.set("maxPrice", budget);
    router.push(`/packages${p.size ? `?${p}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="glass-strong relative grid gap-1 rounded-[1.75rem] p-2 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:rounded-full">
      <div ref={box} className="relative">
        <label className="flex items-center gap-3 rounded-full px-4 py-2.5 transition focus-within:bg-white/5 hover:bg-white/5">
          <MapPin size={18} className="shrink-0 text-sun-400" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-bold tracking-widest text-white/45 uppercase">Where to?</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => sugs.length && setOpen(true)}
              placeholder="Bali, Kashmir, Europe…"
              className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/35"
              aria-label="Destination"
              autoComplete="off"
            />
          </span>
        </label>
        <AnimatePresence>
          {open && sugs.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="glass-strong absolute top-full left-0 z-30 mt-2 w-full min-w-72 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
            >
              {sugs.map((s) => (
                <li key={s.href}>
                  <button type="button" onClick={() => router.push(s.href)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10">
                    <span className="truncate font-medium text-white">{s.label}</span>
                    <span className="shrink-0 text-xs text-white/45">{s.sub}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <SelectCell icon={<Globe2 size={18} className="text-aqua-400" />} label="Trip type" value={type} onChange={setType} options={[["", "Anywhere"], ["domestic", "India"], ["international", "International"]]} />
      <SelectCell icon={<CalendarDays size={18} className="text-sun-400" />} label="Duration" value={duration} onChange={setDuration} options={[["", "Any length"], ["1-4", "Up to 4 days"], ["5-7", "5–7 days"], ["8-10", "8–10 days"], ["11-30", "11+ days"]]} />
      <SelectCell icon={<Wallet size={18} className="text-aqua-400" />} label="Budget" value={budget} onChange={setBudget} options={budgets.map((b) => [b.value, b.label])} />
      <button type="submit" className="btn-primary !h-full min-h-13 !rounded-full !px-7">
        <Search size={18} /> <span className="md:hidden lg:inline">Search</span>
      </button>
    </form>
  );
}

function SelectCell({ icon, label, value, onChange, options }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-full px-4 py-2.5 transition hover:bg-white/5">
      {icon}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[10px] font-bold tracking-widest text-white/45 uppercase">{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-white outline-none" aria-label={label}>
          {options.map(([v, l]) => (
            <option key={v} value={v} className="bg-ink-800">
              {l}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
