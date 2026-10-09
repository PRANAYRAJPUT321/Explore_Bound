"use client";

import { BadgeIndianRupee, Headphones, HeartHandshake, Map, ShieldCheck, Stamp } from "lucide-react";
import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const features = [
  { icon: Map, title: "Handcrafted itineraries", text: "Every route is travelled and refined by our own team — no copy-paste trips." },
  { icon: BadgeIndianRupee, title: "Best price promise", text: "Direct contracts with hotels & partners. Found it cheaper? We'll match it." },
  { icon: Headphones, title: "24×7 on-trip support", text: "A real human on WhatsApp and phone, day or night, wherever you are." },
  { icon: Stamp, title: "Visa & forex desk", text: "Documentation, appointments, insurance and forex — handled end to end." },
  { icon: ShieldCheck, title: "Verified stays & drivers", text: "Hand-inspected hotels and background-checked drivers & guides." },
  { icon: HeartHandshake, title: "Flexible payments", text: "Book with 25% advance, pay the rest 21 days before you fly." },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {v.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function WhyUs() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <div className="grid gap-4 rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgb(255_255_255/0.04),transparent)] p-6 sm:grid-cols-2 md:p-10 lg:grid-cols-4">
        {site.stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center lg:border-r lg:border-white/10 lg:last:border-0"
          >
            <div className="font-display text-5xl font-extrabold text-gradient md:text-6xl">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-sm tracking-wide text-white/55">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="eyebrow">✦ Why Explore Bound</span>
          <h2 className="mt-4 text-4xl leading-[1.05] font-bold md:text-6xl">
            We sweat the details, <span className="text-gradient">you make memories.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/60">
            We&apos;re a team of obsessive travellers who believe a holiday should feel effortless from the first call to the last photo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 2) * 0.1, duration: 0.7 }}
              className="group card relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-sun-500/10 blur-2xl transition group-hover:bg-sun-500/25" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-sun-300 ring-1 ring-white/10">
                <f.icon size={22} />
              </div>
              <h3 className="relative mt-5 font-display text-xl font-bold">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-white/55">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
