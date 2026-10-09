"use client";

import { ArrowDown, ArrowUpRight, CalendarClock, Play, Star, Users } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Price } from "@/components/ui/Price";
import { Globe } from "@/components/three/Globe";
import type { GlobeMarker } from "@/components/three/GlobeScene";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { HeroSearch } from "./HeroSearch";

const words = ["mountains", "beaches", "cultures", "islands", "horizons"];

type Props = {
  markers: GlobeMarker[];
  rating: { average: number; total: number };
  nextDeparture: { title: string; slug: string; startDate: string; seatsLeft: number } | null;
  spotlight: { title: string; slug: string; price: number; destination: string } | null;
};

export function Hero({ markers, rating, nextDeparture, spotlight }: Props) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const globeY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const globeScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={ref} className="grain relative isolate min-h-[100svh] overflow-hidden pt-28 pb-24 md:pt-28">
      {/* aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/3 -left-1/4 h-[70vh] w-[70vw] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(255_138_61/0.28),transparent)] blur-2xl" />
        <div className="absolute top-1/4 -right-1/4 h-[80vh] w-[60vw] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(63_230_201/0.18),transparent)] blur-2xl [animation-delay:-6s]" />
        <div className="absolute bottom-0 left-1/3 h-[50vh] w-[50vw] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(124_108_255/0.18),transparent)] blur-2xl [animation-delay:-12s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,var(--color-ink-950))]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link href="/reviews" className="eyebrow !normal-case !tracking-normal hover:border-sun-400/40">
              <span className="flex items-center gap-0.5 text-sun-400">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} size={12} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <span className="text-white/80">
                {rating.total > 0 ? `${rating.average.toFixed(1)}/5 from ${rating.total} verified reviews` : "Loved by travellers across India"}
              </span>
            </Link>
          </motion.div>

          <h1 className="mt-6 font-display text-[2.9rem] leading-[0.98] font-extrabold tracking-tight text-white sm:text-6xl lg:text-[5.4rem]">
            <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              Explore beyond
            </motion.span>
            <span className="relative block h-[1.1em] overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={words[i]}
                  initial={{ y: "100%", opacity: 0, rotateX: -60 }}
                  animate={{ y: "0%", opacity: 1, rotateX: 0 }}
                  exit={{ y: "-100%", opacity: 0, rotateX: 60 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-gradient absolute left-0 block pb-2"
                >
                  {words[i]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
          >
            Handcrafted domestic & international holidays, honeymoons and group adventures — planned by experts, booked in minutes, supported 24×7 wherever you roam.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }} className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/plan-my-trip" className="btn-ghost">
              Plan a custom trip <ArrowUpRight size={16} />
            </Link>
            <button onClick={() => window.dispatchEvent(new Event("eb:open-assistant"))} className="group flex items-center gap-3 px-2 text-sm font-semibold text-white/80 hover:text-white">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-aqua-400/40" />
                <Play size={16} fill="currentColor" className="relative ml-0.5" />
              </span>
              Ask our trip assistant
            </button>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: globeY, scale: globeScale }} className="relative -mx-5 h-[min(105vw,520px)] md:mx-0 lg:h-[620px]">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            <Globe markers={markers} hub={site.hub} className="h-full w-full" />
          </motion.div>

          {spotlight && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute top-[8%] right-2 md:right-0">
              <Link href={`/packages/${spotlight.slug}`} className="glass-strong block animate-float rounded-2xl px-4 py-3 shadow-2xl [--float-rot:2deg] hover:border-sun-400/40">
                <div className="text-[10px] font-bold tracking-widest text-sun-300 uppercase">🔥 Trending now</div>
                <div className="mt-1 max-w-48 truncate text-sm font-semibold text-white">{spotlight.title}</div>
                <div className="text-xs text-white/55">
                  from <Price inr={spotlight.price} className="font-bold text-white" /> / person
                </div>
              </Link>
            </motion.div>
          )}

          {nextDeparture && (
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5, duration: 0.8 }} className="absolute bottom-[14%] left-3 md:left-0">
              <Link href={`/packages/${nextDeparture.slug}`} className="glass-strong flex animate-float-slow items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl [--float-rot:-2deg] hover:border-aqua-400/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua-400/15 text-aqua-300">
                  <CalendarClock size={20} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold tracking-widest text-aqua-300 uppercase">Next group departure</span>
                  <span className="block max-w-44 truncate text-sm font-semibold text-white">{nextDeparture.title}</span>
                  <span className="flex items-center gap-1 text-xs text-white/55">
                    {formatDate(nextDeparture.startDate, { day: "numeric", month: "short" })} · <Users size={11} /> {nextDeparture.seatsLeft} seats left
                  </span>
                </span>
              </Link>
            </motion.div>
          )}

          <div className="pointer-events-none absolute top-0 left-1/2 hidden -translate-x-1/2 text-[11px] tracking-wide text-white/35 lg:block">
            Drag to spin · hover a pin · click to explore
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5 }}
        className="relative z-20 mx-auto mt-4 max-w-6xl px-5 md:px-8 lg:-mt-10"
      >
        <HeroSearch />
      </motion.div>

      <motion.a
        href="#discover"
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase md:flex"
      >
        Scroll
        <span className="flex h-10 w-6 justify-center rounded-full border border-white/20 pt-2">
          <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ArrowDown size={12} />
          </motion.span>
        </span>
      </motion.a>
    </section>
  );
}
