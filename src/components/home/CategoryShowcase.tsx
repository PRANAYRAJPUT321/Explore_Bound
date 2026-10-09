"use client";

import { ArrowRight, Globe2, Landmark } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { PackageCard } from "@/components/packages/PackageCard";
import type { PackageCard as Card } from "@/db/queries";
import { cn } from "@/lib/utils";

export function CategoryShowcase({ domestic, international }: { domestic: Card[]; international: Card[] }) {
  const [tab, setTab] = useState<"domestic" | "international">("international");
  const list = tab === "domestic" ? domestic : international;
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="eyebrow">✦ Two worlds, one journey</span>
          <h2 className="mt-4 text-4xl leading-[1.05] font-bold md:text-6xl">
            Holidays crafted for <span className="text-gradient">every horizon</span>
          </h2>
          <p className="mt-4 text-white/60 md:text-lg">From Himalayan high passes to Maldivian lagoons — pick a world and find your perfect escape.</p>
        </div>
        <div className="glass relative flex rounded-full p-1.5">
          {(
            [
              ["international", "International", <Globe2 key="g" size={16} />],
              ["domestic", "Incredible India", <Landmark key="l" size={16} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("relative z-10 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition", tab === id ? "text-ink-950" : "text-white/70 hover:text-white")}>
              {tab === id && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-sunset" transition={{ type: "spring", bounce: 0.25, duration: 0.6 }} />}
              {icon} {label}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: -6 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-6 [perspective:1500px] sm:grid-cols-2 lg:grid-cols-3"
        >
          {list.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.6 }}>
              <PackageCard pkg={p} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="mt-12 flex justify-center">
        <Link href={`/packages?type=${tab}`} className="btn-ghost group">
          View all {tab === "domestic" ? "India" : "international"} packages <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
