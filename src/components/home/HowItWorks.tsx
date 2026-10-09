"use client";

import { Compass, CreditCard, Plane, SlidersHorizontal } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

const steps = [
  { icon: Compass, title: "Discover", text: "Spin the globe, browse handpicked packages or tell our assistant your vibe and budget." },
  { icon: SlidersHorizontal, title: "Customise", text: "Choose hotel category, add-ons and dates — or let a trip expert tailor every day for you." },
  { icon: CreditCard, title: "Book in minutes", text: "Lock your trip with just 25% advance. Instant booking reference, zero hidden charges." },
  { icon: Plane, title: "Travel worry-free", text: "Visa, transfers and stays sorted. A real human is on WhatsApp 24×7 while you roam." },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const planeX = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">✦ How it works</span>
          <h2 className="mt-4 text-4xl font-bold md:text-6xl">
            From daydream to <span className="text-lagoon">departure gate</span>
          </h2>
        </div>
        <div ref={ref} className="relative mt-16">
          {/* flight path */}
          <div className="absolute top-10 right-[12%] left-[12%] hidden h-px md:block">
            <div className="h-full w-full border-t-2 border-dashed border-white/10" />
            <motion.div style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-sunset" />
            <motion.div style={{ left: planeX }} className="absolute -top-3 -ml-3 text-sun-300">
              <Plane size={24} className="rotate-45" fill="currentColor" />
            </motion.div>
          </div>
          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative text-center"
              >
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-sunset opacity-20 blur-xl" />
                  <div className="glass-strong relative flex h-20 w-20 rotate-6 items-center justify-center rounded-3xl transition hover:rotate-0">
                    <s.icon size={30} className="text-sun-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-ink-950">{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/55">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
