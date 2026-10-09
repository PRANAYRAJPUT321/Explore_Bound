"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe } from "@/components/three/Globe";
import { Price } from "@/components/ui/Price";
import { SmartImage } from "@/components/ui/SmartImage";
import type { DestinationSummary } from "@/db/queries";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function DestinationExplorer({ destinations }: { destinations: DestinationSummary[] }) {
  const router = useRouter();
  const [region, setRegion] = useState<"all" | "domestic" | "international">("all");
  const [focus, setFocus] = useState<string | null>(null);
  const list = destinations.filter((d) => region === "all" || d.region === region);
  const focused = destinations.find((d) => d.slug === focus);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div className="relative h-[420px] md:h-[560px] lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-[radial-gradient(70%_60%_at_50%_45%,rgb(43_109_255/0.18),transparent_70%)]" />
        <Globe
          markers={list.map((d) => ({ slug: d.slug, name: d.name, lat: d.lat, lng: d.lng, region: d.region, tagline: d.tagline }))}
          hub={site.hub}
          focus={focus}
          onSelect={(slug) => router.push(`/destinations/${slug}`)}
          className="h-full w-full"
        />
        <div className="pointer-events-none absolute top-5 left-6 flex gap-4 text-xs text-white/55">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sun-400" /> India
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-aqua-400" /> International
          </span>
        </div>
        {focused && (
          <motion.div key={focused.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong pointer-events-none absolute bottom-5 left-5 right-5 rounded-2xl p-4 md:right-auto md:w-80">
            <div className="text-[10px] font-bold tracking-widest text-sun-300 uppercase">{focused.country}</div>
            <div className="font-display text-2xl font-bold">{focused.name}</div>
            <div className="text-sm text-white/60">{focused.tagline}</div>
            <div className="mt-2 text-xs text-white/50">Best time: {focused.bestTime}</div>
          </motion.div>
        )}
      </div>

      <div>
        <div className="glass mb-6 inline-flex rounded-full p-1.5">
          {(
            [
              ["all", "All"],
              ["domestic", "India"],
              ["international", "International"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} onClick={() => setRegion(id)} className={cn("relative rounded-full px-5 py-2 text-sm font-semibold transition", region === id ? "text-ink-950" : "text-white/65 hover:text-white")}>
              {region === id && <motion.span layoutId="dest-pill" className="absolute inset-0 rounded-full bg-sunset" />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <ul className="space-y-3" onMouseLeave={() => setFocus(null)}>
          {list.map((d, i) => (
            <motion.li key={d.slug} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
              <Link
                href={`/destinations/${d.slug}`}
                onMouseEnter={() => setFocus(d.slug)}
                onFocus={() => setFocus(d.slug)}
                className={cn("group flex items-center gap-4 rounded-3xl border p-3 transition", focus === d.slug ? "border-sun-400/40 bg-white/[0.06]" : "border-white/10 hover:border-white/20")}
              >
                <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <SmartImage src={d.heroImage} alt={d.name} label={d.name} width={300} className="h-full w-full transition duration-700 group-hover:scale-110" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-xs text-white/45">
                    <MapPin size={12} className={d.region === "domestic" ? "text-sun-400" : "text-aqua-400"} /> {d.country}
                  </span>
                  <span className="block font-display text-xl font-bold text-white">{d.name}</span>
                  <span className="block truncate text-sm text-white/55">{d.tagline}</span>
                </span>
                <span className="hidden shrink-0 text-right sm:block">
                  <span className="block text-[10px] tracking-widest text-white/40 uppercase">{d.packageCount} trips</span>
                  {d.fromPrice ? (
                    <span className="text-sm text-white/60">
                      from <Price inr={d.fromPrice} className="font-bold text-white" />
                    </span>
                  ) : (
                    <span className="text-xs text-white/50">On request</span>
                  )}
                </span>
                <ArrowUpRight size={18} className="shrink-0 text-white/30 transition group-hover:rotate-45 group-hover:text-sun-300" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
