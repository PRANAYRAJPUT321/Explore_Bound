"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ items, className }: { items: { q: string; a: string }[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.q} className={cn("rounded-3xl border transition", on ? "border-sun-400/30 bg-white/[0.05]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}>
            <button onClick={() => setOpen(on ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={on}>
              <span className="font-display text-lg font-semibold text-white">{it.q}</span>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300", on ? "rotate-45 bg-sunset text-ink-950" : "bg-white/10")}>
                <Plus size={16} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm leading-relaxed text-white/65">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
