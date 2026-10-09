"use client";

import { GitCompare, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAX_COMPARE, useApp } from "@/components/providers/AppProvider";
import { SmartImage } from "@/components/ui/SmartImage";

type Mini = { id: number; title: string; coverImage: string };

export function CompareBar() {
  const { compare, toggleCompare, clearCompare, hydrated } = useApp();
  const pathname = usePathname();
  const [items, setItems] = useState<Mini[]>([]);

  useEffect(() => {
    if (!compare.length) {
      setItems([]);
      return;
    }
    fetch(`/api/packages?ids=${compare.join(",")}`)
      .then((r) => r.json())
      .then((rows: Mini[]) => setItems(rows))
      .catch(() => {});
  }, [compare]);

  const show = hydrated && compare.length > 0 && pathname !== "/compare" && !pathname.startsWith("/admin");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
          className="no-print glass-strong fixed bottom-4 left-1/2 z-[65] flex w-[calc(100vw-7rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-full p-2 pl-4 shadow-2xl md:left-1/2"
        >
          <GitCompare size={18} className="hidden shrink-0 text-aqua-300 sm:block" />
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {Array.from({ length: MAX_COMPARE }).map((_, i) => {
              const it = items[i];
              return it ? (
                <div key={`pkg-${it.id}`} className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-aqua-400/50" title={it.title}>
                  <SmartImage src={it.coverImage} alt={it.title} label="" width={100} className="h-full w-full" />
                  <button onClick={() => toggleCompare(it.id)} className="absolute inset-0 flex items-center justify-center bg-ink-950/70 opacity-0 transition group-hover:opacity-100" aria-label={`Remove ${it.title}`}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div key={`slot-${i}`} className="h-10 w-10 shrink-0 rounded-full border border-dashed border-white/20" />
              );
            })}
            <span className="ml-1 hidden truncate text-xs text-white/60 sm:inline">{compare.length}/{MAX_COMPARE} selected</span>
          </div>
          <button onClick={clearCompare} className="text-xs text-white/50 hover:text-white">
            Clear
          </button>
          <Link href={`/compare?ids=${compare.join(",")}`} className="btn-aqua !px-4 !py-2.5 whitespace-nowrap">
            Compare
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
