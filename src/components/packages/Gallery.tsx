"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const n = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i === null ? null : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (index === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [index, go]);

  return (
    <>
      <div className="grid h-[52vh] min-h-[360px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[2rem] md:h-[62vh] md:gap-3">
        {images.slice(0, 4).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setIndex(i)}
            className={`group relative overflow-hidden ${i === 0 ? "col-span-4 row-span-2 md:col-span-2" : i === 1 ? "hidden md:col-span-2 md:block" : "hidden md:block"}`}
            aria-label={`Open photo ${i + 1}`}
          >
            <SmartImage src={src} alt={`${title} photo ${i + 1}`} label={title} width={i === 0 ? 1600 : 800} priority={i === 0} className="h-full w-full transition duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-ink-950/0 transition group-hover:bg-ink-950/20" />
          </button>
        ))}
      </div>
      <button onClick={() => setIndex(0)} className="glass-strong absolute right-4 bottom-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold md:right-6 md:bottom-6">
        <Images size={16} /> View all {n} photos
      </button>

      <AnimatePresence>
        {index !== null && (
          <motion.div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950/95 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="Photo gallery">
            <button onClick={() => setIndex(null)} className="absolute top-5 right-5 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Close gallery">
              <X size={20} />
            </button>
            <button onClick={() => go(-1)} className="absolute left-3 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20 md:left-8" aria-label="Previous photo">
              <ChevronLeft />
            </button>
            <button onClick={() => go(1)} className="absolute right-3 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20 md:right-8" aria-label="Next photo">
              <ChevronRight />
            </button>
            <AnimatePresence mode="wait">
              <motion.div key={index} initial={{ opacity: 0, scale: 0.94, rotateY: -12 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} exit={{ opacity: 0, scale: 0.96, rotateY: 12 }} transition={{ duration: 0.4 }} className="h-[75vh] w-[92vw] max-w-6xl overflow-hidden rounded-3xl">
                <SmartImage src={images[index]} alt={`${title} photo ${index + 1}`} label={title} width={2000} className="h-full w-full !object-contain" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-sun-400" : "w-2 bg-white/30"}`} aria-label={`Photo ${i + 1}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
