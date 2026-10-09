"use client";

import { BedDouble, ChevronDown, Utensils } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ItineraryDay } from "@/db/schema";
import { cn } from "@/lib/utils";

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const all = open.size === days.length;
  const toggle = (d: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button onClick={() => setOpen(all ? new Set() : new Set(days.map((d) => d.day)))} className="text-sm font-semibold text-sun-300 hover:text-sun-200">
          {all ? "Collapse all" : "Expand all days"}
        </button>
      </div>
      <ol className="relative space-y-4">
        <div className="absolute top-4 bottom-4 left-[23px] w-px bg-gradient-to-b from-sun-400 via-coral-500 to-aqua-400 opacity-40" />
        {days.map((d, i) => {
          const on = open.has(d.day);
          return (
            <motion.li key={d.day} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: Math.min(i * 0.04, 0.3) }} className="relative pl-16">
              <span
                className={cn(
                  "absolute top-3 left-0 flex h-12 w-12 flex-col items-center justify-center rounded-2xl border text-center leading-none transition",
                  on ? "border-transparent bg-sunset text-ink-950" : "border-white/15 bg-ink-850 text-white",
                )}
              >
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-70">Day</span>
                <span className="font-display text-lg font-bold">{d.day}</span>
              </span>
              <div className={cn("rounded-3xl border transition", on ? "border-white/15 bg-white/[0.05]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}>
                <button onClick={() => toggle(d.day)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={on}>
                  <span className="font-display text-lg font-semibold text-white">{d.title}</span>
                  <ChevronDown size={18} className={cn("shrink-0 text-white/50 transition", on && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <p className="text-sm leading-relaxed text-white/70">{d.description}</p>
                        {d.activities?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {d.activities.map((a) => (
                              <span key={a} className="rounded-full bg-aqua-400/10 px-3 py-1 text-xs text-aqua-300">
                                ✦ {a}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/55">
                          {d.meals && (
                            <span className="flex items-center gap-1.5">
                              <Utensils size={13} className="text-sun-400" /> {d.meals}
                            </span>
                          )}
                          {d.stay && (
                            <span className="flex items-center gap-1.5">
                              <BedDouble size={13} className="text-sun-400" /> {d.stay}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
