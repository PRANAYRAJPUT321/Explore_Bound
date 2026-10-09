"use client";

import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Stars } from "@/components/ui/Stars";
import type { Testimonial } from "@/db/queries";
import { initials } from "@/lib/utils";

const tints = ["from-sun-400 to-coral-500", "from-aqua-400 to-sky-glow", "from-coral-400 to-pink-500", "from-violet-400 to-aqua-400"];

function Card({ t, i }: { t: Testimonial; i: number }) {
  return (
    <div className="glass-strong relative flex h-full flex-col rounded-[2rem] p-6 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] md:p-7">
      <Quote size={36} className="text-sun-400/40" fill="currentColor" />
      <Stars value={t.rating} size={15} className="mt-3" />
      <h3 className="mt-3 font-display text-xl leading-snug font-bold text-white">“{t.title}”</h3>
      <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-white/65">{t.comment}</p>
      <div className="mt-auto flex items-center gap-3 pt-6">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tints[i % tints.length]} text-sm font-bold text-ink-950`}>{initials(t.name)}</span>
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">{t.name}</div>
          <div className="truncate text-xs text-white/50">
            {t.location}
            {t.packageTitle ? ` · ${t.packageTitle}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials3D({ items, average, total }: { items: Testimonial[]; average: number; total: number }) {
  const [mobile, setMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const rotation = useMotionValue(0);
  const smooth = useSpring(rotation, { stiffness: 60, damping: 20, mass: 0.6 });
  const transform = useTransform(smooth, (r) => `translateZ(calc(var(--radius) * -1)) rotateY(${r}deg)`);
  const drag = useRef<{ x: number; r: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useAnimationFrame((_, delta) => {
    if (paused || drag.current || mobile) return;
    rotation.set(rotation.get() - delta * 0.006);
  });

  if (!items.length) return null;
  const n = items.length;
  const step = 360 / n;

  const nudge = (dir: number) => {
    const snapped = Math.round(rotation.get() / step) * step;
    rotation.set(snapped + dir * step);
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_50%,rgb(63_230_201/0.08),transparent)]" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow">✦ Traveller stories</span>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
            Don&apos;t take our word. <span className="text-gradient">Take theirs.</span>
          </h2>
          {total > 0 && (
            <div className="mt-6 flex items-center gap-3 text-white/70">
              <Stars value={average} size={18} />
              <span>
                <b className="text-white">{average.toFixed(1)}</b> average from {total} reviews
              </span>
            </div>
          )}
        </div>
      </div>

      {mobile ? (
        <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4" data-lenis-prevent>
          {items.map((t, i) => (
            <div key={t.id} className="w-[85vw] max-w-sm shrink-0 snap-center">
              <Card t={t} i={i} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="relative mt-14 h-[460px] cursor-grab select-none [perspective:1800px] active:cursor-grabbing"
          style={{ ["--radius" as string]: `${Math.max(420, n * 70)}px` }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            drag.current = null;
          }}
          onPointerDown={(e) => (drag.current = { x: e.clientX, r: rotation.get() })}
          onPointerMove={(e) => {
            if (drag.current) rotation.set(drag.current.r + (e.clientX - drag.current.x) * 0.25);
          }}
          onPointerUp={() => (drag.current = null)}
        >
          <motion.div className="absolute top-0 left-1/2 h-full w-[340px] -translate-x-1/2 [transform-style:preserve-3d]" style={{ transform }}>
            {items.map((t, i) => (
              <div
                key={t.id}
                className="absolute inset-0 [backface-visibility:hidden]"
                style={{ transform: `rotateY(${i * step}deg) translateZ(var(--radius))` }}
              >
                <Card t={t} i={i} />
              </div>
            ))}
          </motion.div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-3">
        {!mobile && (
          <>
            <button onClick={() => nudge(1)} className="glass flex h-12 w-12 items-center justify-center rounded-full hover:bg-white/15" aria-label="Previous">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => nudge(-1)} className="glass flex h-12 w-12 items-center justify-center rounded-full hover:bg-white/15" aria-label="Next">
              <ArrowRight size={18} />
            </button>
          </>
        )}
        <Link href="/reviews" className="btn-primary ml-2">
          Read all reviews
        </Link>
        <Link href="/reviews#write" className="btn-ghost">
          Write a review
        </Link>
      </div>
    </section>
  );
}
